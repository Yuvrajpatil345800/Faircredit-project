# FairCredit: Windows & VS Code Setup Guide

This guide provides exact, step-by-step instructions for running the **FairCredit** application on a Windows development machine using Visual Studio Code.

---

## 1. Prerequisites
Ensure the following tools are installed on your Windows machine:
1. **Python 3.10 or higher**: [Download from python.org](https://www.python.org/downloads/)
   - *Important*: During installation, check the box **"Add python.exe to PATH"**.
2. **Node.js (v18 or higher)**: [Download from nodejs.org](https://nodejs.org/)
3. **Visual Studio Code**: [Download from code.visualstudio.com](https://code.visualstudio.com/)
   - Recommended extensions: **Python**, **Pylance**, **ESLint**.

---

## 2. Project Folder Structure
```text
FairCredit/
│
├── backend/                             # Python FastAPI ML Backend
│   ├── artifacts/                       # Saved .joblib model files & metadata
│   ├── tests/                           # Automated pytest suite
│   │   └── test_api.py
│   ├── main.py                          # FastAPI REST API endpoints
│   ├── train_and_export.py              # Model training & Fairlearn export script
│   ├── generate_report.py               # python-docx technical report generator
│   └── requirements.txt                 # Pinned Python dependencies
│
├── public/
│   └── assets/aistudio/                 # German Credit CSV dataset
│       └── german_credit_fc977ae7.csv
│
├── src/                                 # React + TypeScript Frontend
│   ├── components/
│   │   ├── layout/                      # Sidebar & Header navigation
│   │   ├── pages/                       # 11 SaaS dashboard pages
│   │   └── common/                      # Modals & settings
│   ├── services/                        # Embedded ML engine & API client
│   └── types/                           # TypeScript interfaces
│
├── package.json
└── README.md
```

---

## 3. Step-by-Step Setup in VS Code

### Step A: Open the Project in VS Code
1. Launch VS Code.
2. Select **File > Open Folder...** and select the `FairCredit` root folder.
3. Open a new terminal by pressing ``Ctrl + ` `` (Backtick) or selecting **Terminal > New Terminal**.

---

### Step B: Set Up the Python FastAPI Backend (Terminal 1)
In the VS Code terminal, navigate to the `backend` folder and configure your virtual environment:

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create a Python virtual environment named 'venv'
python -m venv venv

# 3. Activate the virtual environment in PowerShell
.\venv\Scripts\Activate.ps1

# (If PowerShell blocks script execution, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# then run .\venv\Scripts\Activate.ps1 again)

# 4. Upgrade pip and install required libraries
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Train the models and export .joblib artifacts
python train_and_export.py

# 6. Start the FastAPI development server
uvicorn main:app --reload --port 8000
```

Once running, you will see:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

- Open interactive Swagger API Documentation in your browser:  
  👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Step C: Run the React + TypeScript Frontend (Terminal 2)
1. In VS Code, click the **`+` (Split Terminal)** or **`+` (New Terminal)** icon on the top-right of the terminal pane.
2. In this new terminal (which starts at the project root), run:

```powershell
# 1. Install frontend packages (if not already installed)
npm install

# 2. Start the Vite React development server
npm run dev
```

3. Open your browser and navigate to:  
   👉 [http://localhost:3000](http://localhost:3000)

---

### Step D: Switch Frontend to FastAPI Mode
1. In the FairCredit dashboard, click the **"Embedded Engine"** button in the header or the bottom of the sidebar.
2. Select **"Standalone Python FastAPI"** mode.
3. Ensure the URL is set to `http://127.0.0.1:8000` and click **"Test Connection"**.
4. You will see a green **"SUCCESS"** indicator confirming the live connection!

---

## 4. Running Automated Tests
To run the automated backend test suite, make sure your virtual environment is activated in the `backend/` folder:

```powershell
pytest tests/ -v
```

This validates:
- Backend `/api/health` status.
- Single applicant manual prediction logic.
- Required column validation error handling (422 responses).
- Batch CSV scoring.
- Demographic parity and equalized odds computations.
- DOCX report generation.

---

## 5. Troubleshooting Common Windows Errors

### Error: `Activate.ps1 cannot be loaded because running scripts is disabled`
- **Cause**: Windows PowerShell security policy.
- **Solution**: Run this in PowerShell before activating:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\venv\Scripts\Activate.ps1
  ```

### Error: `Port 8000 is already in use`
- **Solution**: Run on an alternative port:
  ```powershell
  uvicorn main:app --reload --port 8001
  ```
  Then in the FairCredit UI settings modal, change the Backend URL to `http://127.0.0.1:8001`.

### Error: `No module named 'fairlearn'`
- **Solution**: Verify your virtual environment is active (you will see `(venv)` in your terminal prompt) and run:
  ```powershell
  pip install -r requirements.txt
  ```
