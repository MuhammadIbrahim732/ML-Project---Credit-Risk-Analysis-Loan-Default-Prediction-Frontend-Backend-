# 💳 Credit Risk Assessment

An end-to-end **Machine Learning application** that estimates the probability of loan default using a trained classification model. Built with **Python, Scikit-learn, and FastAPI**, the application provides an interactive web interface where users can submit applicant details and instantly view a risk assessment through an animated probability gauge.

The application is deployed as a **single service on Render**, with FastAPI powering both the prediction API and the frontend.
Live Demo: https://ml-project-credit-risk-analysis-loan.onrender.com

---

## ✨ Key Features

- 🎯 **Real-Time Risk Prediction** — Estimate loan default probability and classify applicants as High Risk or Low Risk.
- 📊 **Animated Risk Gauge** — Visualize default probability with a dynamic semicircular gauge and decision threshold marker.
- 🧮 **Automatic Feature Engineering** — Calculate `loan_percent_income` from the requested loan amount and annual income.
- 🛡️ **Input Validation** — Validate user inputs in the browser and enforce server-side validation using Pydantic.
- ⚠️ **Error Handling** — Display meaningful messages for invalid inputs, API errors, and network failures.
- 📱 **Responsive UI** — Support desktop and mobile screens, keyboard navigation, dark mode, and reduced-motion preferences.
- 🚀 **Single-Service Deployment** — Serve the frontend and prediction API through FastAPI without requiring a separate frontend server or CORS configuration.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Programming Language** | Python 3.11 |
| **Backend** | FastAPI, Uvicorn |
| **Machine Learning** | Scikit-learn, Pandas |
| **Data Validation** | Pydantic v2 |
| **Model Serialization** | Joblib |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Deployment** | Render |
| **API Documentation** | Swagger UI, ReDoc |

## 🏗️ System Architecture

```text
                 ┌──────────────────────┐
                 │     Web Interface    │
                 │   HTML / CSS / JS    │
                 └──────────┬───────────┘
                            │
                            │ POST /predict
                            ▼
                 ┌──────────────────────┐
                 │       FastAPI        │
                 │  Pydantic Validation │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Trained ML Model   │
                 │ Credit_Risk_Model.pkl│
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Default Probability  │
                 │    predict_proba()   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Decision Threshold   │
                 │ Best_Threshold.pkl   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ JSON Response + UI   │
                 │ Gauge, Risk & Result │
                 └──────────────────────┘
```

## 📂 Project Structure

```text
credit-risk-app/
│
├── main.py                     # FastAPI application and prediction endpoint
├── requirements.txt            # Python dependencies
├── render.yaml                 # Render deployment configuration
├── runtime.txt                 # Python runtime configuration
├── .python-version             # Python version specification
│
├── Credit_Risk_Model.pkl       # Trained classification model
├── Best_Threshold.pkl          # Optimized decision threshold
│
└── static/
    ├── index.html              # Application form and results
    ├── style.css               # Styling, animations, and dark mode
    └── script.js               # API integration and gauge animation
```

> **Note:** The trained model and threshold files must be available at the paths expected by the application. Add your own model artifacts before deployment.

## 📋 Input Features

The application uses the following applicant and loan characteristics to generate a prediction.

| Feature | Type | Description |
|---|---|---|
| `person_age` | Integer | Applicant's age in years |
| `person_income` | Float | Annual income |
| `person_home_ownership` | String | `RENT`, `OWN`, `MORTGAGE`, or `OTHER` |
| `person_emp_length` | Float | Employment length in years |
| `loan_intent` | String | Purpose of the loan |
| `loan_grade` | String | Loan grade from `A` to `G` |
| `loan_amnt` | Float | Requested loan amount |
| `loan_int_rate` | Float | Interest rate in percentage |
| `loan_percent_income` | Float | Loan amount divided by annual income |
| `cb_person_default_on_file` | String | Previous default indicator: `Y` or `N` |
| `cb_person_cred_hist_length` | Integer | Credit history length in years |

**Important:** Categorical values must match the labels used during model training. Update the frontend options and backend validation if your training dataset uses different values.

## 🔌 API Reference

### `POST /predict`

Accepts loan applicant information and returns a default probability, predicted class, decision threshold, and risk category.

**Example request**

```json
{
  "person_age": 28,
  "person_income": 55000,
  "person_home_ownership": "RENT",
  "person_emp_length": 4,
  "loan_intent": "PERSONAL",
  "loan_grade": "B",
  "loan_amnt": 10000,
  "loan_int_rate": 11.5,
  "loan_percent_income": 0.18,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 5
}
```

**Example response**

```json
{
  "default_probability": 0.2134,
  "default_prediction": 0,
  "threshold": 0.42,
  "Result": "Low Risk"
}
```

*The values above are illustrative examples, not verified model outputs.*

### Response Fields

| Field | Description |
|---|---|
| `default_probability` | Estimated probability of default, between 0 and 1 |
| `default_prediction` | `1` if the probability meets or exceeds the threshold; otherwise `0` |
| `threshold` | Decision threshold loaded from `Best_Threshold.pkl` |
| `Result` | Risk classification: `High Risk` or `Low Risk` |

### Interactive API Documentation

Once the application is running, explore and test the API through:

- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`

## 💻 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

On macOS or Linux:

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the Application

```bash
uvicorn main:app --reload
```

### 5. Open the Application

| Resource | URL |
|---|---|
| Web Interface | http://127.0.0.1:8000 |
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

## ☁️ Deployment on Render

### Option 1: Blueprint Deployment (Recommended)

1. Push the project repository to GitHub.
2. Ensure the required model artifacts are included or otherwise available to the deployed service.
3. Open Render and select **New → Blueprint**.
4. Connect your GitHub repository.
5. Review the configuration in `render.yaml` and deploy the service.

### Option 2: Manual Deployment

1. Create a new **Web Service** on Render.
2. Connect the GitHub repository.
3. Configure the following commands:

**Build command**

```bash
pip install -r requirements.txt
```

**Start command**

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

4. Configure the Python runtime to match the project's requirements.

### Deployment Notes

- Free-tier services may sleep when idle, resulting in a delay on the first request.
- Pin compatible versions of `scikit-learn`, `numpy`, and other relevant dependencies.
- Use the same compatible environment for training and loading serialized model artifacts.
- Keep model file paths consistent with the application's configuration.

## 📈 Model Performance

Evaluate the model using appropriate classification metrics, particularly because credit-risk datasets can have imbalanced classes.

| Metric | Score |
|---|---|
| ROC-AUC | To be added |
| Precision | To be added |
| Recall | To be added |
| F1-Score | To be added |

**Model evaluation should document:**

- Dataset source, size, and target distribution.
- Data cleaning and preprocessing techniques.
- Categorical encoding and numerical scaling.
- Class-imbalance handling, if applicable.
- Model selection, hyperparameter tuning, and threshold optimization.
- Validation strategy and final test-set results.

*Replace the placeholders with measured results from your actual evaluation.*

## ⚠️ Limitations

- Predictions are estimates based on historical training data and may be inaccurate.
- Historical data may contain biases that affect model predictions.
- Performance may degrade when real-world inputs differ significantly from the training distribution.
- This project is intended for educational and portfolio purposes, not as a standalone system for real-world lending decisions.

## 🔮 Future Improvements

- [ ] **Explainable AI:** Integrate SHAP to explain the factors influencing individual predictions.
- [ ] **Automated Testing:** Add unit and integration tests using Pytest and FastAPI's test client.
- [ ] **Model Monitoring:** Track data drift and changes in prediction distributions.
- [ ] **Docker Support:** Containerize the application for reproducible deployment.
- [ ] **CI/CD Pipeline:** Automate testing and deployment through GitHub Actions.
- [ ] **Prediction History:** Add persistent storage and a dashboard for reviewing previous assessments.

## 👨‍💻 Author

**Muhammad Ibrahim**  
Software Engineering Graduate | Aspiring AI/ML Engineer

- **GitHub:** https://github.com/MuhammadIbrahim732
- **LinkedIn:** https://www.linkedin.com/in/muhammad-ibrahim-python

## 📄 License

This project does not yet specify a license. To distribute it as open source, choose an appropriate license and add the corresponding `LICENSE` file to the repository. The MIT License is one possible option.
