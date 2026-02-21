import numpy as np
import matplotlib.pyplot as plt

# --- 1. CONFIGURATION (AUSTIN ENERGY DATA) ---
TIMESTEPS = 200        # Each step = 1 minute
THRESHOLD = 1141.0     # Austin's Record Peak (MW)
BASELINE_LOAD = 850.0  # High-demand summer afternoon (MW)
AI_SPIKE_VALUE = 350.0 # Massive AI Data Center Campus (MW)
SPIKE_TIME = 50        # When the AI cluster spins up

# --- 2. GENERATE BASELINE ---
time = np.arange(TIMESTEPS)
# Add some "noise" to represent thousands of AC units turning on/off
grid_load = np.full(TIMESTEPS, BASELINE_LOAD) + np.random.normal(0, 5, TIMESTEPS)

# --- 3. THE SIMULATION LOOP ---
# We will track the final "Adjusted" load here
final_output = np.zeros(TIMESTEPS)
outage_log = np.zeros(TIMESTEPS) # 0 = Normal, 1 = Outage
throttled = False

for t in range(TIMESTEPS):
    # What the demand WOULD be if no throttling happens
    current_ai_load = AI_SPIKE_VALUE if t >= SPIKE_TIME else 0
    total_attempted_load = grid_load[t] + current_ai_load

    if not throttled:
        # CHECK THRESHOLD (The "Grid-Guard" Logic)
        if total_attempted_load > THRESHOLD:
            print(f"![CRITICAL] at t={t}: Load {total_attempted_load:.2f}MW exceeds Austin Peak!")
            throttled = True
            throttle_start_time = t
            impact_magnitude = current_ai_load 
            final_output[t] = total_attempted_load # The peak before it drops
            outage_log[t] = 1 # Mark start of outage
        else:
            final_output[t] = total_attempted_load
            outage_log[t] = 0 # Normal
            
    else:
        # 4. THE MATH FLEX: SECOND-ORDER DAMPING
        rel_t = t - throttle_start_time
        zeta = 0.15  
        omega = 0.4  
        
        # Grid is recovering, but wait, do people still want power? YES!
        # The true *Demand* is still total_attempted_load, but the *Supply/Grid* is forcing it down.
        # This mismatch (Demand > Supply) IS the outage!
        
        recovery_swing = impact_magnitude * np.exp(-zeta * rel_t) * np.cos(omega * rel_t)
        final_output[t] = grid_load[t] + recovery_swing
        
        # If the total attempted demand is still higher than our forced/throttled supply, 
        # people are experiencing an outage.
        if total_attempted_load > final_output[t]:
             outage_log[t] = 1
        else:
             outage_log[t] = 0

# --- 4. EXPORT DATASHEET ---
import pandas as pd
df = pd.DataFrame({
    'Time_Minute': time,
    'Attempted_Demand_MW': grid_load + (np.where(time >= SPIKE_TIME, AI_SPIKE_VALUE, 0)),
    'Actual_Grid_Supply_MW': final_output,
    'Is_Outage': outage_log.astype(int)
})

# Save to CSV
df.to_csv("power_simulation_data.csv", index=False)
print("Datasheet saved to 'power_simulation_data.csv'")

# --- 5. VISUALIZATION ---
plt.figure(figsize=(12, 6))
plt.plot(time, final_output, label="Total Grid Load (MW)", color='#1f77b4', lw=2)
plt.axhline(y=THRESHOLD, color='red', linestyle='--', label="Austin Peak Threshold (1,141 MW)")

# Formatting to make it look professional
plt.fill_between(time, final_output, THRESHOLD, where=(final_output > THRESHOLD), color='red', alpha=0.3, label="Grid Overload")
plt.title("Grid-Guard: Predictive Throttling & Physical Stabilization (Austin, TX)")
plt.xlabel("Time (Minutes)")
plt.ylabel("Power Demand (MW)")
plt.grid(True, alpha=0.3)
plt.legend()

# Highlight the "Math Flex" area
plt.annotate('AI Throttled: Grid Stabilizing...', xy=(SPIKE_TIME+10, 900), xytext=(SPIKE_TIME+40, 1050),
             arrowprops=dict(facecolor='black', shrink=0.05))

plt.show()