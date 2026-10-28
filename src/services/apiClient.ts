/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Python FastAPI Backend Client
 */

import {
  GermanCreditApplicant,
  PredictionResult,
  BackendStatus,
  FairnessAuditSummary,
  ModelPerformanceMetrics,
} from '../types';
import { predictApplicant, TEST_SET_EVALUATION, VERIFIED_TEST_FAIRNESS_AUDIT, PROXY_VARIABLE_ANALYSIS } from './mlEngine';

const DEFAULT_API_URL = 'http://127.0.0.1:8000';

class ApiClient {
  private apiUrl: string = DEFAULT_API_URL;
  private mode: 'embedded' | 'fastapi' = 'embedded';

  constructor() {
    const savedUrl = localStorage.getItem('faircredit_api_url');
    if (savedUrl) this.apiUrl = savedUrl;
    const savedMode = localStorage.getItem('faircredit_mode') as 'embedded' | 'fastapi' | null;
    if (savedMode) this.mode = savedMode;
  }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  public setApiUrl(url: string) {
    this.apiUrl = url;
    localStorage.setItem('faircredit_api_url', url);
  }

  public getMode(): 'embedded' | 'fastapi' {
    return this.mode;
  }

  public setMode(mode: 'embedded' | 'fastapi') {
    this.mode = mode;
    localStorage.setItem('faircredit_mode', mode);
  }

  public async checkHealth(): Promise<BackendStatus> {
    if (this.mode === 'embedded') {
      return {
        mode: 'embedded',
        apiUrl: this.apiUrl,
        isConnected: true,
        isChecking: false,
        lastChecked: new Date().toLocaleTimeString(),
        serverInfo: {
          version: '1.0.0 (Embedded ML Engine)',
          modelArtifactsLoaded: true,
          scikitLearnVersion: '1.5.0-compatible',
          fairlearnVersion: '0.10.0-compatible',
          activeModel: 'LogisticRegression(penalty=l2, max_iter=1000)',
        },
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.apiUrl}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        mode: 'fastapi',
        apiUrl: this.apiUrl,
        isConnected: true,
        isChecking: false,
        lastChecked: new Date().toLocaleTimeString(),
        serverInfo: {
          version: data.version || '1.0.0',
          modelArtifactsLoaded: data.models_loaded ?? true,
          scikitLearnVersion: data.scikit_learn_version || '1.5.1',
          fairlearnVersion: data.fairlearn_version || '0.10.0',
          activeModel: data.active_model || 'LogisticRegression',
        },
      };
    } catch (err: any) {
      return {
        mode: 'fastapi',
        apiUrl: this.apiUrl,
        isConnected: false,
        isChecking: false,
        lastChecked: new Date().toLocaleTimeString(),
        error: err.name === 'AbortError' ? 'Connection timed out (3s). Is FastAPI running on port 8000?' : (err.message || 'Unable to connect to FastAPI backend.'),
      };
    }
  }

  public async predict(applicant: GermanCreditApplicant, thresholdFemale = 0.5, thresholdMale = 0.5): Promise<PredictionResult> {
    if (this.mode === 'fastapi') {
      try {
        const res = await fetch(`${this.apiUrl}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicant,
            threshold_female: thresholdFemale,
            threshold_male: thresholdMale,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            prediction: data.prediction,
            predictionNumeric: data.prediction === 'GOOD' ? 1 : 0,
            probabilityGood: data.probability_good,
            probabilityBad: data.probability_bad,
            riskScore: Math.round(data.probability_good * 100),
            riskTier: data.risk_tier || (data.probability_good >= 0.7 ? 'Low Risk' : data.probability_good >= 0.45 ? 'Moderate Risk' : 'High Risk'),
            derivedGender: data.derived_gender,
            explanation: data.explanation,
            limitations: data.limitations,
            mitigatedPrediction: data.mitigated_prediction,
            mitigatedProbabilityGood: data.mitigated_probability_good,
            thresholdApplied: data.threshold_applied,
          };
        }
      } catch (err) {
        console.warn('FastAPI predict failed, falling back to embedded ML engine:', err);
      }
    }

    // Embedded Engine
    return predictApplicant(applicant, thresholdFemale, thresholdMale);
  }

  public async getEvaluation(): Promise<ModelPerformanceMetrics[]> {
    if (this.mode === 'fastapi') {
      try {
        const res = await fetch(`${this.apiUrl}/api/evaluation`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI evaluation fetch failed, using verified test set:', err);
      }
    }
    return TEST_SET_EVALUATION;
  }

  public async getFairnessAudit(): Promise<FairnessAuditSummary> {
    if (this.mode === 'fastapi') {
      try {
        const res = await fetch(`${this.apiUrl}/api/fairness`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI fairness fetch failed, using verified audit:', err);
      }
    }
    return VERIFIED_TEST_FAIRNESS_AUDIT;
  }

  public async getProxyAnalysis() {
    if (this.mode === 'fastapi') {
      try {
        const res = await fetch(`${this.apiUrl}/api/proxy-analysis`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI proxy analysis fetch failed:', err);
      }
    }
    return PROXY_VARIABLE_ANALYSIS;
  }
}

export const apiClient = new ApiClient();
