import pandas as pd
import pmdarima as pm
from data_pipeline import load_and_clean_data

def train_arima_model(X_exog, y_load):
    """
    Trains a lightweight pmdarima model using exogenous variables.
    """
    print("Training ARIMA model... This may take a few seconds.")
    # Fit auto_arima with exogenous variables
    # We use m=1 (non-seasonal) and basic parameters for speed in the hackathon
    model = pm.auto_arima(
        y_load, 
        X=X_exog,
        start_p=1, start_q=1,
        max_p=3, max_q=3,
        m=1,              
        start_P=0, seasonal=False,
        d=None, D=0, 
        trace=True,
        error_action='ignore',  
        suppress_warnings=True, 
        stepwise=True
    )
    print("ARIMA Model Training Complete!")
    print(model.summary())
    return model

def predict_baseline(model, mock_weather_dict, X_exog):
    """
    Predicts the baseline megawatt load for the day given a mock weather forecast.
    mock_weather_dict: e.g., {'WIND SPEED': 0, 'PRCP': 0, 'SNOW': 0, 'Snow Depth': 0, 'TMAX': 105, 'TMIN': 80, 'Cause': 0}
    """
    # Ensure correct order of features matching the training data
    exog_cols = X_exog.columns
    exog_df = pd.DataFrame([mock_weather_dict])[exog_cols]
    
    # Predict 1 step ahead
    forecast = model.predict(n_periods=1, X=exog_df)
    
    return forecast.iloc[0]

def predict_ai_pue(tmax):
    """
    Predicts the Power Usage Effectiveness (PUE) of a data center based on outside temperature.
    A modern liquid-cooled data center might have a PUE of 1.15 at 70F.
    As temperature rises (e.g., to 105F), cooling chillers work harder, raising PUE.
    """
    baseline_temp = 70.0
    baseline_pue = 1.15
    pue_increase_per_degree = 0.008  # E.g., at 105F (35 deg hotter), PUE increases by ~0.28 to 1.43
    
    if tmax <= baseline_temp:
        return baseline_pue
    else:
        return baseline_pue + (tmax - baseline_temp) * pue_increase_per_degree

if __name__ == "__main__":
    # Test script locally
    X, X_exog, y_load = load_and_clean_data(r"c:\Users\Adity\Downloads\TVG Hackathon\TVGHackathon")
    
    # Train
    model = train_arima_model(X_exog, y_load)
    
    # Predict mock extreme hot day
    mock_weather = {
        'WIND SPEED': 5.0, 
        'PRCP': 0.0, 
        'SNOW': 0.0, 
        'Snow_Depth': 0.0, 
        'TMAX': 105.0, 
        'TMIN': 80.0, 
        'Cause': 0
    }
    
    predicted_load = predict_baseline(model, mock_weather, X_exog)
    print(f"\n--- MOCK FORECAST ---")
    print(f"Max Temp: {mock_weather['TMAX']} F")
    print(f"Predicted Baseline Grid Load: {predicted_load:.2f} MW")
