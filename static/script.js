// Same-origin by default (FastAPI serves this UI). Set a full URL if hosting the UI elsewhere.
const API_URL = "/predict";
// This API uses a fixed 0.5 cut-off (see main.py), so the gauge marker is fixed too.
const THRESHOLD = 0.5;

const form = document.getElementById("form");
const submitBtn = document.getElementById("submit");
const resetBtn = document.getElementById("reset");
const result = document.getElementById("result");
const arc = document.getElementById("arc");
const tick = document.getElementById("tick");
const pctEl = document.getElementById("pct");
const badge = document.getElementById("badge");
const thresholdEl = document.getElementById("threshold");
const decisionEl = document.getElementById("decision");
const note = document.getElementById("note");

const num = (name) => parseFloat(form.elements[name].value);

// Loan-to-income ratio is derived, so users don't have to calculate it.
function updateRatio() {
  const income = num("person_income");
  const amount = num("loan_amnt");
  form.elements.loan_percent_income.value =
    income > 0 && amount >= 0 ? (amount / income).toFixed(2) : "";
}
form.elements.person_income.addEventListener("input", updateRatio);
form.elements.loan_amnt.addEventListener("input", updateRatio);
updateRatio();

function validate() {
  let ok = true;
  form.querySelectorAll("input[type=number]:not([readonly])").forEach((el) => {
    const bad = el.value === "" || !el.checkValidity();
    el.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  return ok;
}
form.addEventListener("input", (e) => e.target.classList.remove("invalid"));

function buildPayload() {
  const d = new FormData(form);
  return {
    person_age: parseInt(d.get("person_age"), 10),
    person_income: parseFloat(d.get("person_income")),
    person_home_ownership: d.get("person_home_ownership"),
    person_emp_length: parseFloat(d.get("person_emp_length")),
    loan_intent: d.get("loan_intent"),
    loan_grade: d.get("loan_grade"),
    loan_amnt: parseFloat(d.get("loan_amnt")),
    loan_int_rate: parseFloat(d.get("loan_int_rate")),
    loan_percent_income: parseFloat(d.get("loan_percent_income")),
    cb_person_default_on_file: d.get("cb_person_default_on_file"),
    cb_person_cred_hist_length: parseInt(d.get("cb_person_cred_hist_length"), 10),
  };
}

let countFrame;
function countUp(target) {
  cancelAnimationFrame(countFrame);
  const start = performance.now();
  const dur = 1300;
  const step = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    pctEl.textContent = (target * eased).toFixed(1);
    if (t < 1) countFrame = requestAnimationFrame(step);
  };
  countFrame = requestAnimationFrame(step);
}

function placeTick(threshold) {
  // Map threshold (0..1) onto the half-circle: left end = 0, right end = 1.
  const a = Math.PI * (1 - threshold);
  const cx = 120, cy = 120;
  const pt = (r) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const [x1, y1] = pt(86);
  const [x2, y2] = pt(114);
  tick.setAttribute("x1", x1); tick.setAttribute("y1", y1);
  tick.setAttribute("x2", x2); tick.setAttribute("y2", y2);
}

function showResult(data) {
  const prob = Number(data.probability_of_default);
  const thr = THRESHOLD;
  const high = data.prediction === 1;

  result.dataset.state = high ? "high" : "low";
  result.classList.remove("pop");
  void result.offsetWidth; // restart the badge animation
  result.classList.add("pop");

  placeTick(thr);
  arc.style.strokeDashoffset = 100 - Math.max(0, Math.min(prob, 1)) * 100;
  countUp(prob * 100);

  badge.textContent = data.risk_status;
  thresholdEl.textContent = (thr * 100).toFixed(1) + "%";
  decisionEl.textContent = high ? "Default expected" : "Repayment expected";
  note.textContent = high
    ? "The estimated probability is at or above the threshold, so this application is flagged."
    : "The estimated probability is below the threshold, so this application is not flagged.";
}

function showError(message) {
  result.dataset.state = "error";
  arc.style.strokeDashoffset = 100;
  pctEl.textContent = "--";
  badge.textContent = "Request failed";
  thresholdEl.textContent = "--";
  decisionEl.textContent = "--";
  note.textContent = message;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) {
    showError("Some fields are empty or out of range. Fix the highlighted fields and try again.");
    return;
  }
  submitBtn.classList.add("loading");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    if (!res.ok) throw new Error(`The server returned status ${res.status}.`);
    showResult(await res.json());
  } catch (err) {
    showError(err.message.startsWith("The server") ? err.message : "Could not reach the API. Check that the server is running.");
  } finally {
    submitBtn.classList.remove("loading");
  }
});

resetBtn.addEventListener("click", () => {
  form.reset();
  updateRatio();
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  cancelAnimationFrame(countFrame);
  result.dataset.state = "idle";
  arc.style.strokeDashoffset = 100;
  pctEl.textContent = "--";
  badge.textContent = "Awaiting input";
  thresholdEl.textContent = "--";
  decisionEl.textContent = "--";
  note.innerHTML = "Fill in the application and select <b>Assess risk</b>.";
});
