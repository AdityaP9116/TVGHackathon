from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
import os

# Prevent Pythons pathing issues on Vercel
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")

from data_pipeline import load_and_clean_data
from model_brain import train_arima_model, predict_baseline
from simulation import check_grid_state

app = FastAPI()

# Equivalent to Streamlit's @st.cache_resource
MODEL = None
X_EXOG = None

class SimulationRequest(BaseModel):
    max_capacity: float
    ai_spike: float
    tmax: float
    tmin: float
    wind: float

def initialize_brain():
    global MODEL, X_EXOG
    if MODEL is None or X_EXOG is None:
        # Load up data pipeline exactly as we did in Streamlit
        # It relies on the relative root path containing the 'data' folder
        X, X_exog, y_load = load_and_clean_data("..")
        MODEL = train_arima_model(X_exog, y_load)
        X_EXOG = X_exog

@app.post("/api/simulate")
def simulate(req: SimulationRequest):
    # Ensure model is trained on first hit
    initialize_brain()
    
    # 1. Prepare Weather Dict
    mock_weather = {
        'WIND SPEED': req.wind, 
        'PRCP': 0.0, 
        'SNOW': 0.0, 
        'Snow_Depth': 0.0, 
        'TMAX': req.tmax, 
        'TMIN': req.tmin, 
        'Cause': 0
    }
    
    # 2. Predict Baseline using imported model logic
    baseline_load = predict_baseline(MODEL, mock_weather, X_EXOG)
    
    # 3. Time Series Construction for Frontend Graphing
    chart_data = []
    
    # Pre-spike realistic noise
    t_pre = np.linspace(-10, -1, 20).tolist()
    noise = np.random.normal(0, 5, len(t_pre))
    load_pre = (np.full(len(t_pre), baseline_load) + noise).tolist()
    
    for i in range(len(t_pre)):
        chart_data.append({"time": t_pre[i], "load": load_pre[i]})
        
    # Spike Peak Impact
    total_peak = baseline_load + req.ai_spike
    chart_data.append({"time": 0, "load": total_peak})
    
    # 4. Math Trigger: Kill Switch stabilization analysis
    is_throttled, math_curve = check_grid_state(baseline_load, req.ai_spike, req.max_capacity)
    math_curve = math_curve.tolist()
    
    # Post-spike math recovery
    t_post = np.linspace(0.1, 10, len(math_curve)).tolist()
    for i in range(len(t_post)):
        chart_data.append({"time": t_post[i], "load": math_curve[i]})
        
    return {
        "baseline_load": float(baseline_load),
        "is_throttled": bool(is_throttled),
        "chart_data": chart_data
    }
