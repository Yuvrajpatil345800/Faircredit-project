"""
FairCredit Platform - Model Training & Artifact Export Pipeline
Replicates and validates the complete Colab training workflow (FairCredit_050c3045.ipynb).
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import sklearn
import fairlearn

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)
from fairlearn.postprocessing import ThresholdOptimizer
from fairlearn.metrics import (
    MetricFrame,
    selection_rate,
    true_positive_rate,
    false_positive_rate,
    demographic_parity_difference,
    demographic_parity_ratio,
    equalized_odds_difference,
)

RANDOM_SEED = 42

def find_dataset_path():
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "public", "assets", "aistudio", "german_credit_fc977ae7.csv"),
        os.path.join(os.path.dirname(__file__), "data", "german_credit.csv"),
        os.path.join(os.path.dirname(__file__), "german_credit.csv"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    raise FileNotFoundError("Could not locate German Credit CSV dataset file.")

def map_gender(val):
    if val in ['A92', 'A95']:
        return 'Female'
    elif val in ['A91', 'A93', 'A94']:
        return 'Male'
    return 'Unknown'

def train_and_export():
    csv_path = find_dataset_path()
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    print(f"Dataset shape: {df.shape}")

    # Standardize target
    y = df['credit_risk'].map({'good': 1, 'bad': 0})
    X = df.drop(columns=['credit_risk'])

    # Sensitive attribute mapping
    sex_col = 'personal_status_sex'
    sensitive_attr = X[sex_col].apply(map_gender)

    # Fairness Through Blindness: Exclude sensitive attribute from model input features
    X_features = X.drop(columns=[sex_col])

    # Stratified 70 / 15 / 15 Split
    X_train_raw, X_temp_raw, y_train, y_temp, sens_train, sens_temp = train_test_split(
        X_features, y, sensitive_attr, test_size=0.3, random_state=RANDOM_SEED, stratify=y
    )
    X_val_raw, X_test_raw, y_val, y_test, sens_val, sens_test = train_test_split(
        X_temp_raw, y_temp, sens_temp, test_size=0.5, random_state=RANDOM_SEED, stratify=y_temp
    )

    num_cols = X_features.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = X_features.select_dtypes(exclude=[np.number]).columns.tolist()

    # Preprocessing Pipeline
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ('num', num_transformer, num_cols),
        ('cat', cat_transformer, cat_cols)
    ])

    # Fit preprocessor on training data only
    X_train = preprocessor.fit_transform(X_train_raw)
    X_val = preprocessor.transform(X_val_raw)
    X_test = preprocessor.transform(X_test_raw)

    print("Preprocessor fitted. Training Baseline Logistic Regression...")
    model = LogisticRegression(random_state=RANDOM_SEED, max_iter=1000)
    model.fit(X_train, y_train)

    print("Training Class-Reweighted Model (Balanced Sample Weights)...")
    reweighted_model = LogisticRegression(random_state=RANDOM_SEED, class_weight='balanced', max_iter=1000)
    reweighted_model.fit(X_train, y_train)

    print("Fitting Fairlearn ThresholdOptimizer for Equalized Odds...")
    optimizer = ThresholdOptimizer(
        estimator=model,
        constraints="equalized_odds",
        predict_method='predict_proba',
        prefit=True
    )
    optimizer.fit(X_val, y_val, sensitive_features=sens_val)

    # Evaluation on Test Set
    y_test_pred_base = model.predict(X_test)
    y_test_proba_base = model.predict_proba(X_test)[:, 1]

    y_test_pred_reweighted = reweighted_model.predict(X_test)
    y_test_pred_mitigated = optimizer.predict(X_test, sensitive_features=sens_test)

    print("\n--- TEST PERFORMANCE (BASELINE) ---")
    print(f"Accuracy:  {accuracy_score(y_test, y_test_pred_base):.4f}")
    print(f"Precision: {precision_score(y_test, y_test_pred_base):.4f}")
    print(f"Recall:    {recall_score(y_test, y_test_pred_base):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_test_pred_base):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, y_test_proba_base):.4f}")

    dp_base = demographic_parity_difference(y_test, y_test_pred_base, sensitive_features=sens_test)
    eo_base = equalized_odds_difference(y_test, y_test_pred_base, sensitive_features=sens_test)
    print(f"Baseline DP Diff: {dp_base:.4f} | EO Diff: {eo_base:.4f}")

    dp_mit = demographic_parity_difference(y_test, y_test_pred_mitigated, sensitive_features=sens_test)
    eo_mit = equalized_odds_difference(y_test, y_test_pred_mitigated, sensitive_features=sens_test)
    print(f"Mitigated DP Diff: {dp_mit:.4f} | EO Diff: {eo_mit:.4f}")

    # Export Artifacts
    artifacts_dir = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    joblib.dump(preprocessor, os.path.join(artifacts_dir, "preprocessor.joblib"))
    joblib.dump(model, os.path.join(artifacts_dir, "baseline_model.joblib"))
    joblib.dump(reweighted_model, os.path.join(artifacts_dir, "reweighted_model.joblib"))
    joblib.dump(optimizer, os.path.join(artifacts_dir, "threshold_optimizer.joblib"))

    metadata = {
        "project": "FairCredit",
        "dataset": "German Credit",
        "total_records": len(df),
        "train_size": len(X_train),
        "val_size": len(X_val),
        "test_size": len(X_test),
        "scikit_learn_version": sklearn.__version__,
        "fairlearn_version": fairlearn.__version__,
        "features": X_features.columns.tolist(),
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "test_metrics": {
            "baseline": {
                "accuracy": float(accuracy_score(y_test, y_test_pred_base)),
                "precision": float(precision_score(y_test, y_test_pred_base)),
                "recall": float(recall_score(y_test, y_test_pred_base)),
                "f1": float(f1_score(y_test, y_test_pred_base)),
                "roc_auc": float(roc_auc_score(y_test, y_test_proba_base)),
                "dp_diff": float(dp_base),
                "eo_diff": float(eo_base),
            },
            "mitigated": {
                "accuracy": float(accuracy_score(y_test, y_test_pred_mitigated)),
                "precision": float(precision_score(y_test, y_test_pred_mitigated)),
                "recall": float(recall_score(y_test, y_test_pred_mitigated)),
                "f1": float(f1_score(y_test, y_test_pred_mitigated)),
                "dp_diff": float(dp_mit),
                "eo_diff": float(eo_mit),
            }
        }
    }

    with open(os.path.join(artifacts_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Successfully saved all artifacts into {artifacts_dir}/")

if __name__ == "__main__":
    train_and_export()
