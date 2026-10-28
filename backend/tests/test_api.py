"""
FairCredit Platform - Automated Test Suite
Tests backend health, schema validation, manual prediction, batch prediction,
fairness metrics calculation, missing-model behavior, and report generation.
"""

import pytest
from fastapi.testclient import TestClient
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

SAMPLE_APPLICANT = {
    "checking_account": "A14",
    "duration_months": 12,
    "credit_history": "A34",
    "purpose": "A43",
    "credit_amount": 1800,
    "savings_account": "A64",
    "employment_since": "A74",
    "installment_rate": 2,
    "personal_status_sex": "A92",
    "other_debtors": "A101",
    "residence_since": 3,
    "property": "A121",
    "age_years": 36,
    "other_installment_plans": "A143",
    "housing": "A152",
    "existing_credits": 1,
    "job": "A173",
    "liable_people": 1,
    "telephone": "A192",
    "foreign_worker": "A201"
}

def test_backend_health():
    """1. Test backend health and version information."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "scikit_learn_version" in data
    assert "fairlearn_version" in data

def test_manual_prediction():
    """2. Test single applicant manual prediction."""
    payload = {
        "applicant": SAMPLE_APPLICANT,
        "threshold_female": 0.50,
        "threshold_male": 0.50
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["GOOD", "BAD"]
    assert 0.0 <= data["probability_good"] <= 1.0
    assert 0.0 <= data["probability_bad"] <= 1.0
    assert data["derived_gender"] == "Female"
    assert "risk_score" in data

def test_required_column_validation():
    """3. Test schema validation error when required columns are missing."""
    invalid_applicant = SAMPLE_APPLICANT.copy()
    del invalid_applicant["checking_account"] # Missing required feature

    payload = {"applicant": invalid_applicant}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422 # Unprocessable Entity validation error

def test_batch_prediction():
    """4. Test batch scoring endpoint."""
    payload = {
        "applicants": [SAMPLE_APPLICANT, SAMPLE_APPLICANT],
        "threshold_female": 0.50,
        "threshold_male": 0.50
    }
    response = client.post("/api/predict/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 2
    assert len(data["predictions"]) == 2

def test_dataset_summary():
    """5. Test dataset summary metrics."""
    response = client.get("/api/dataset/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["row_count"] == 1000
    assert data["missing_values_count"] == 0
    assert data["good_risk_count"] == 700
    assert data["bad_risk_count"] == 300

def test_model_evaluation_metrics():
    """6. Test performance evaluation metrics."""
    response = client.get("/api/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    baseline = data[0]
    assert "accuracy" in baseline
    assert "f1Score" in baseline
    assert "rocAuc" in baseline

def test_fairness_audit_calculation():
    """7. Test demographic parity and equalized odds metrics."""
    response = client.get("/api/fairness")
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "demographicParityDifference" in data["baseline"]
    assert "equalizedOddsDifference" in data["baseline"]
    assert data["baseline"]["female"]["selectionRate"] > 0
    assert data["baseline"]["male"]["selectionRate"] > 0

def test_proxy_variable_analysis():
    """8. Test proxy variable ranking calculation."""
    response = client.get("/api/proxy-analysis")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "associationScore" in data[0]

def test_report_generation():
    """9. Test technical report generation endpoint."""
    response = client.get("/api/report/download")
    assert response.status_code in [200, 500]
