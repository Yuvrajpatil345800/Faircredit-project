# FairCredit: Algorithmic Bias Auditing & Mitigation in Digital Micro-Lending

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Fairlearn](https://img.shields.io/badge/Fairlearn-0.10.0-F97316)](https://fairlearn.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5.0-F7931E?logo=scikit-learn)](https://scikit-learn.org)

An enterprise-grade, academic credit fairness auditing and mitigation platform designed for digital micro-lending risk assessments. Built with a modern fintech dashboard in **React 19 + TypeScript** and backed by a decoupled **Python FastAPI** machine learning service.

---

## 1. Project Domain & Course Alignment
- **Domain**: FinTech / Algorithmic Ethics / Trustworthy AI
- **Course Code**: **ADCOR1PC303** (Advanced AI & Machine Learning Ethics)
- **NBA Accreditation Alignment**: SAR Criterion 3 (Course Outcomes CO1–CO3, Bloom's Cognitive Levels BL2–BL6, Program Outcomes PO1–PO9, PSO1–PSO3)
- **Evaluation Weightage**: Standard 25-Mark CIAP Evaluation Rubric

---

## 2. Key Capabilities & 11 Core Modules

1. **Executive Overview Dashboard**: High-level KPI summary, donut risk distribution, grouped confusion matrix, and baseline vs mitigated fairness metrics.
2. **Individual Credit Prediction**: Multi-section 20-feature German Credit applicant assessment form with preset profiles, probability indicators, and educational limitations.
3. **Batch CSV Predictions**: Drag-and-drop CSV upload, column validation, bulk scoring, good/bad risk ratios, and CSV/JSON export.
4. **Dataset Explorer**: 1,000-sample UCI German Credit data exploration, zero-null audit, feature distribution histograms, and correlation heatmap.
5. **Model Evaluation & Benchmarking**: Stratified out-of-sample benchmarking on 150 test cases for Baseline Logistic Regression, Class-Reweighted, and ThresholdOptimizer models with ROC curve and confusion matrices.
6. **Fairlearn Fairness Audit**: Group-wise slices (`personal_status_sex`: Female A92/A95 vs Male A91/A93/A94), Demographic Parity Difference (10.6%), Disparate Impact (86.0% / 80% Rule), and Equalized Odds (10.5%).
7. **Bias Mitigation Workspace**: Interactive threshold tuning simulator for live Pareto frontier exploration.
8. **Proxy Variable Analysis**: Cramer's V and Pearson r association ranking for non-sensitive features (housing, collateral property, age).
9. **Financial Decision-Support & Business Impact**: Dynamic loan portfolio simulation modeling net interest margin, default loss rate, and inclusion trade-offs.
10. **Reports & Exports**: Chapter reader (7 academic chapters) and downloadable Word `.docx` technical documentation formatted per IEEE and university guidelines.
11. **Project Information**: Full syllabus mapping, NBA CO-PO alignment matrix, 25-mark CIAP rubric table, and ethical disclaimers.

---

## 3. Implementation Verification Checklist

| Feature | Implementation Status | Artifact / Dependency |
| :--- | :--- | :--- |
| **Dataset Loading & Validation** | ✅ **Genuinely Implemented** | 1,000 observations (`german_credit_fc977ae7.csv`) |
| **Manual Applicant Scoring** | ✅ **Genuinely Implemented** | Exact Logistic Regression weights + scaling equations |
| **Batch CSV Upload & Scoring** | ✅ **Genuinely Implemented** | Client & Server CSV parser + batch inference |
| **Fairness Metrics (MetricFrame)**| ✅ **Genuinely Implemented** | Fairlearn formula outputs matching training notebook |
| **Proxy Variable Identification** | ✅ **Genuinely Implemented** | Empirical Cramer's V & Pearson correlations |
| **Interactive Threshold Tuning** | ✅ **Genuinely Implemented** | Dynamic Pareto frontier simulation |
| **FastAPI REST API Service** | ✅ **Genuinely Implemented** | `backend/main.py` with `/docs` Swagger |
| **DOCX Report Generation** | ✅ **Genuinely Implemented** | `backend/generate_report.py` (python-docx) |
| **Automated Unit Tests** | ✅ **Genuinely Implemented** | `backend/tests/test_api.py` (pytest) |
| **External Model Artifacts** | ⚙️ **Configurable** | Can run via Embedded ML or local FastAPI `.joblib` |

---

## 4. Quick Start (Running Both Servers in VS Code)

### Terminal 1: Python FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python train_and_export.py
uvicorn main:app --reload --port 8000
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Terminal 2: React + TypeScript Frontend
```bash
npm install
npm run dev
```
Web Application: [http://localhost:3000](http://localhost:3000)

Detailed Windows guide: See [backend/SETUP_GUIDE_WINDOWS_VSCODE.md](backend/SETUP_GUIDE_WINDOWS_VSCODE.md).

---

## 5. Automated Testing
Run the backend test suite:
```bash
cd backend
pytest tests/ -v
```

---

## 6. Educational Prototype Disclaimer
FairCredit is developed as an academic micro-project prototype for demonstrating algorithmic bias auditing and mitigation. It must not be deployed for automated commercial credit decisions without human oversight and compliance review under the Equal Credit Opportunity Act (ECOA) and applicable fair lending regulations.
