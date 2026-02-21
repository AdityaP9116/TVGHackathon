import streamlit as st
import numpy as np
import pandas as pd
import time
from data_pipeline import load_and_clean_data
from model_brain import train_arima_model, predict_baseline
from simulation import check_grid_state

# ==========================================
# STREAMLIT CONFIG & STATE
# ==========================================
st.set_page_config(page_title="Grid-Guard POC", layout="wide")

st.title("⚡ Grid-Guard: Automated Compute-Throttling System")
st.markdown("""
Welcome to the Grid-Guard Prototype. This dashboard simulates the ERCOT power grid, projecting a baseline load using a live ARIMA model, injecting massive AI Data Center usage, and triggering an automated stabilization sequence when safe thresholds are breached.
""")

if 'model' not in st.session_state:
    st.session_state.model = None
if 'X_exog' not in st.session_state:
    st.session_state.X_exog = None
if 'is_trained' not in st.session_state:
    st.session_state.is_trained = False

# ==========================================
# SIDEBAR CONFIGURATION
# ==========================================
st.sidebar.header("⚙️ Simulation Settings")

max_capacity = st.sidebar.slider("MAX_SAFE_CAPACITY (MW)", min_value=3500, max_value=5000, value=4000, step=50)
ai_spike = st.sidebar.slider("AI_DATA_CENTER_SPIKE (MW)", min_value=100, max_value=1000, value=600, step=50)

st.sidebar.header("🌡️ Mock Extreme Weather")
mock_tmax = st.sidebar.number_input("Max Temp (TMAX)", value=105.0)
mock_tmin = st.sidebar.number_input("Min Temp (TMIN)", value=80.0)
mock_wind = st.sidebar.number_input("Wind Speed", value=5.0)

# ==========================================
# MODEL TRAINING BUTTON
# ==========================================
if not st.session_state.is_trained:
    if st.button("Train Predictive Brain (ARIMA)"):
        with st.spinner("Loading data and training lightweight ARIMA model... (This takes a few seconds)"):
            X, X_exog, y_load = load_and_clean_data(r"c:\Users\Adity\Downloads\TVG Hackathon\TVGHackathon")
            model = train_arima_model(X_exog, y_load)
            
            st.session_state.model = model
            st.session_state.X_exog = X_exog
            st.session_state.is_trained = True
        st.success("Brain Initialized! Ready for Simulation.")

# ==========================================
# LIVE SIMULATION DASHBOARD
# ==========================================
if st.session_state.is_trained:
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Compute Status")
        status_placeholder = st.empty()
        status_placeholder.success("🟢 AI Cluster: FULL COMPUTE")
        
        st.subheader("Grid Metrics")
        baseline_metric = st.empty()
        total_metric = st.empty()
    
    with col2:
        st.subheader("Live Grid Load (MW)")
        chart_placeholder = st.empty()

    if st.button("🚀 Run Live Grid Simulation"):
        # 1. Predict Baseline
        mock_weather = {
            'WIND SPEED': mock_wind, 
            'PRCP': 0.0, 
            'SNOW': 0.0, 
            'Snow_Depth': 0.0, 
            'TMAX': mock_tmax, 
            'TMIN': mock_tmin, 
            'Cause': 0
        }
        
        baseline_load = predict_baseline(st.session_state.model, mock_weather, st.session_state.X_exog)
        
        baseline_metric.metric("Baseline Grid Load", f"{baseline_load:.2f} MW")
        
        # 2. Setup Plot Arrays
        # Pre-spike is just baseline with minor noise for realism
        t_pre = np.linspace(-10, -1, 20)
        noise = np.random.normal(0, 5, len(t_pre))
        load_pre = np.full(len(t_pre), baseline_load) + noise
        
        # Determine if kill switch triggers
        is_throttled, math_curve = check_grid_state(baseline_load, ai_spike, max_capacity)
        
        # 3. Dynamic Plotting Loop
        # We will iterate through the simulation arrays to mimic live incoming data
        
        live_time = []
        live_load = []
        
        # ANIMATE: Pre-Spike
        for i in range(len(t_pre)):
            live_time.append(t_pre[i])
            live_load.append(load_pre[i])
            
            total_metric.metric("Current Total Load", f"{load_pre[i]:.2f} MW")
            
            df = pd.DataFrame({"Time": live_time, "Total Load (MW)": live_load}).set_index("Time")
            chart_placeholder.line_chart(df)
            time.sleep(0.1)
            
        # ANIMATE: SPIKE HITS
        total_peak = baseline_load + ai_spike
        live_time.append(0)
        live_load.append(total_peak)
        
        total_metric.metric("Current Total Load", f"{total_peak:.2f} MW", delta=f"+{ai_spike} MW", delta_color="inverse")
        df = pd.DataFrame({"Time": live_time, "Total Load (MW)": live_load}).set_index("Time")
        chart_placeholder.line_chart(df)
        time.sleep(0.5) # Pause for dramatic effect when limits are breached
        
        # ANIMATE: Post-Spike / Recovery
        if is_throttled:
            status_placeholder.error("🔴 AI Cluster: THROTTLED (Grid Stabilizing)")
            t_post = np.linspace(0.1, 10, len(math_curve))
            
            for i in range(len(t_post)):
                live_time.append(t_post[i])
                live_load.append(math_curve[i])
                
                total_metric.metric("Current Total Load", f"{math_curve[i]:.2f} MW")
                df = pd.DataFrame({"Time": live_time, "Total Load (MW)": live_load}).set_index("Time")
                chart_placeholder.line_chart(df)
                time.sleep(0.05)
                
            status_placeholder.success("🟢 Grid Stabilized. AI Cluster: RESUMING SECURE COMPUTE")
        else:
            # Flatline at the new safe capacity
            t_post = np.linspace(0.1, 10, len(math_curve))
            for i in range(len(t_post)):
                live_time.append(t_post[i])
                live_load.append(math_curve[i])
                
                total_metric.metric("Current Total Load", f"{math_curve[i]:.2f} MW")
                df = pd.DataFrame({"Time": live_time, "Total Load (MW)": live_load}).set_index("Time")
                chart_placeholder.line_chart(df)
                time.sleep(0.05)

