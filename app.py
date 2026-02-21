import streamlit as st
import numpy as np
import pandas as pd
import time
from data_pipeline import load_and_clean_data
from model_brain import train_arima_model, predict_baseline, predict_ai_pue
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

st.sidebar.header("🔌 AI Data Center Calculator")
gpu_type = st.sidebar.selectbox("GPU Architecture", ["NVIDIA H100", "NVIDIA A100", "NVIDIA B200"])
gpu_power_map = {"NVIDIA A100": 400, "NVIDIA H100": 700, "NVIDIA B200": 1000}
num_gpus = st.sidebar.number_input("Number of GPUs", min_value=1000, max_value=500000, value=100000, step=10000)

st.sidebar.header("🌡️ Mock Extreme Weather")
mock_tmax = st.sidebar.number_input("Max Temp (TMAX)", value=105.0)
mock_tmin = st.sidebar.number_input("Min Temp (TMIN)", value=80.0)
mock_wind = st.sidebar.number_input("Wind Speed", value=5.0)

# Calculate dynamic PUE based on TMAX prediction
predicted_pue = predict_ai_pue(mock_tmax)
st.sidebar.metric("Predicted Facility PUE", f"{predicted_pue:.2f}")

# Calculate AI Spike in MW
ai_spike = (num_gpus * gpu_power_map[gpu_type] * predicted_pue) / 1_000_000
st.sidebar.info(f"**Predicted AI Load:** {ai_spike:.2f} MW")

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
        live_time = []
        live_supply = []
        live_demand = []
        
        # ANIMATE: Pre-Spike
        for i in range(len(t_pre)):
            live_time.append(t_pre[i])
            live_supply.append(load_pre[i])
            live_demand.append(load_pre[i])
            
            total_metric.metric("Current Total Load", f"{load_pre[i]:.2f} MW")
            
            df = pd.DataFrame({"Time": live_time, "Grid Supply (MW)": live_supply, "Attempted Demand (MW)": live_demand}).set_index("Time")
            chart_placeholder.line_chart(df, color=["#1f77b4", "#ff7f0e"])
            time.sleep(0.05)
            
        # ANIMATE: SPIKE HITS
        total_peak = baseline_load + ai_spike
        live_time.append(0)
        live_supply.append(total_peak)
        live_demand.append(total_peak)
        
        total_metric.metric("Current Total Load", f"{total_peak:.2f} MW", delta=f"+{ai_spike:.2f} MW", delta_color="inverse")
        df = pd.DataFrame({"Time": live_time, "Grid Supply (MW)": live_supply, "Attempted Demand (MW)": live_demand}).set_index("Time")
        chart_placeholder.line_chart(df, color=["#1f77b4", "#ff7f0e"])
        time.sleep(0.5) # Pause for dramatic effect
        
        # ANIMATE: Post-Spike / Recovery
        if is_throttled:
            status_placeholder.error("🔴 AI Cluster: THROTTLED (Grid Stabilizing)")
            t_post = np.linspace(0.1, 10, len(math_curve))
            outage_minutes = 0
            
            for i in range(len(t_post)):
                live_time.append(t_post[i])
                live_supply.append(math_curve[i])
                live_demand.append(total_peak) # Demand remains high but supply is throttled
                
                if total_peak > math_curve[i]:
                    outage_minutes += 1
                
                total_metric.metric("Current Total Load", f"{math_curve[i]:.2f} MW")
                df = pd.DataFrame({"Time": live_time, "Grid Supply (MW)": live_supply, "Attempted Demand (MW)": live_demand}).set_index("Time")
                chart_placeholder.line_chart(df, color=["#1f77b4", "#ff7f0e"])
                time.sleep(0.05)
                
            status_placeholder.success(f"🟢 Grid Stabilized. AI Cluster: RESUMING SECURE COMPUTE. (Outage Prevented: {outage_minutes} units)")
            
            # Export CSV functionality similar to Arjun's
            final_df = pd.DataFrame({"Time": live_time, "Grid_Supply_MW": live_supply, "Attempted_Demand_MW": live_demand})
            csv = final_df.to_csv(index=False).encode('utf-8')
            st.download_button("📥 Download Simulation Data", csv, "power_simulation_data.csv", "text/csv")
            
        else:
            # Flatline at the new safe capacity
            t_post = np.linspace(0.1, 10, len(math_curve))
            for i in range(len(t_post)):
                live_time.append(t_post[i])
                live_supply.append(math_curve[i])
                live_demand.append(math_curve[i])
                
                total_metric.metric("Current Total Load", f"{math_curve[i]:.2f} MW")
                df = pd.DataFrame({"Time": live_time, "Grid Supply (MW)": live_supply, "Attempted Demand (MW)": live_demand}).set_index("Time")
                chart_placeholder.line_chart(df, color=["#1f77b4", "#1f77b4"])
                time.sleep(0.05)

