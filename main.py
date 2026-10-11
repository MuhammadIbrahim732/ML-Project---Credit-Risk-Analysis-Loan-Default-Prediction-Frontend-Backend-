from contextlib import asynccontextmanager
import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

ml_model = {}

# 1. Define the input parameters expected by your model
# Replace/add field names to match the exact column names your pipeline trained on
class CreditRiskInput(BaseModel):
    person_age: int
    person_income: float
    person_home_ownership: str
    person_emp_length: float
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    loan_percent_income: float
    cb_person_default_on_file: str
    cb_person_cred_hist_length: int

@asynccontextmanager
async def lifespan(app: FastAPI):
    model = xgb.XGBClassifier()
    model.load_model("Credit_Risk_Model.json")
    meta = joblib.load("pipeline_meta.pkl")
    
    ml_model["model"] = model
    ml_model["preprocessor"] = meta["preprocessor"]
    ml_model["calibrators"] = meta["calibrators"]
    ml_model["classes"] = meta["classes"]
    yield
    ml_model.clear()

app = FastAPI(title="Credit Risk API", lifespan=lifespan)

def compute_calibrated_proba(features):
    model = ml_model["model"]
    calibrators = ml_model["calibrators"]
    
    if not calibrators:
        return model.predict_proba(features)
    
    raw_proba = model.predict_proba(features)
    all_calibrated_probas = []
    
    for fold_calibrators in calibrators:
        calibrator = fold_calibrators[0]
        prob_pos = calibrator.predict(raw_proba[:, 1])
        prob_pos = np.clip(prob_pos, 0.0, 1.0)
        prob_neg = 1.0 - prob_pos
        all_calibrated_probas.append(np.column_stack([prob_neg, prob_pos]))
        
    return np.mean(all_calibrated_probas, axis=0)

# 2. Accept the parameters here in the endpoint
@app.post("/predict")
def predict_credit_risk(payload: CreditRiskInput):
    # Convert Pydantic model to a 1-row DataFrame
    input_df = pd.DataFrame([payload.model_dump()])
    
    # Pass raw DataFrame through the saved preprocessor
    transformed_features = ml_model["preprocessor"].transform(input_df)
    
    # Calculate calibrated probabilities
    probabilities = compute_calibrated_proba(transformed_features)
    
    # Probability of default (class 1)
    default_prob = float(probabilities[0][1])
    prediction = int(default_prob >= 0.5)
    
    return {
        "prediction": prediction,
        "risk_status": "High Risk (Default)" if prediction == 1 else "Low Risk (Non-Default)",
        "probability_of_default": round(default_prob, 4)
    }

app.mount("/", StaticFiles(directory="static", html=True), name="static")