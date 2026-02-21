import pandas as pd
import numpy as np
import os

def load_and_clean_data(base_path="."):
    """
    Ingests and cleans Grid Load, Weather, and Outage CSVs (actually Excel files in the data folder).
    Returns the feature matrix (X) and target variable (y_load) ready for ARIMA modeling.
    """
    print("Loading raw data from Excel files...")
    # 1. Load and clean grid load data
    load_xlsx_path = os.path.join(base_path, 'data', 'Yearly Load Archives', '20-24_Load_Data.xlsx')
    weather_xlsx_path = os.path.join(base_path, 'data', 'Austin Weather Data', '2020 (1_1) - 2024 (5_29).xlsx')
    outage_xlsx_path = os.path.join(base_path, 'data', 'OutageDates.xlsx')

    load_data = pd.read_excel(load_xlsx_path)
    # The exact column name might be 'hour_data' based on the notebook, but 
    # if it throws an error in testing, we might need to inspect the raw excel.
    # We will assume it matches the notebook structure for now.
    load_data['hour_data'] = pd.to_datetime(load_data['hour_data'], errors='coerce')
    load_data = load_data.dropna(subset=['hour_data'])
    
    # Remove every 24th row to avoid midnight issues
    load_data = load_data[~load_data.index.isin(range(23, len(load_data), 24))]
    load_data.set_index('hour_data', inplace=True)
    
    # Clean string artifacts and convert to float (in case it's string in excel)
    if load_data['previous_load_demand'].dtype == object:
        load_data['previous_load_demand'] = load_data['previous_load_demand'].astype(str).str.replace(',', '').astype('float64')
    
    # Resample to daily average
    load_data_daily = load_data.resample('D').mean()

    # 2. Load and clean weather data
    weather_data = pd.read_excel(weather_xlsx_path)
    weather_data['DATE'] = pd.to_datetime(weather_data['DATE'])
    weather_data = weather_data.set_index('DATE').resample('D').ffill()

    # 3. Load and clean outage data
    outage_data = pd.read_excel(outage_xlsx_path)
    outage_data['Date'] = pd.to_datetime(outage_data['Date'])
    outage_data = outage_data.set_index('Date').resample('D').ffill()

    # Filter outage data to relevant dates
    outage_data = outage_data[(outage_data.index >= load_data_daily.index.min()) & (outage_data.index <= load_data_daily.index.max())]

    # 4. Merge datasets
    data = load_data_daily.merge(weather_data.reset_index(), left_index=True, right_on='DATE', how='inner')
    data.set_index('DATE', inplace=True)
    data = data.merge(outage_data, left_index=True, right_on='Date', how='left')
    
    data.reset_index(drop=True, inplace=True)
    data = data.interpolate(method='linear')

    # 5. Create 24-day lag features for predictive modeling
    for lag in range(1, 25):
        data[f'previous_load_demand_lag_{lag}'] = data['previous_load_demand'].shift(lag)

    data = data.dropna()

    # 6. Isolate Features (X) and Target (y_load)
    exog_vars = ['WIND SPEED', 'PRCP', 'SNOW', 'Snow_Depth', 'TMAX', 'TMIN', 'Cause']
    ar_features = [col for col in data.columns if col.startswith('previous_load_demand_lag_')]
    features = ar_features + exog_vars
    
    target_load = 'previous_load_demand'

    X = data[features]
    y_load = data[target_load]
    X_exog = data[exog_vars]

    return X, X_exog, y_load

if __name__ == "__main__":
    X, X_exog, y = load_and_clean_data(r"c:\Users\Adity\Downloads\TVG Hackathon\TVGHackathon")
    print("Features shape:", X.shape)
    print("Exogenous feature shape:", X_exog.shape)
    print("Target shape:", y.shape)
