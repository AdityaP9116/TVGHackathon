import numpy as np

def calculate_stabilization_curve(baseline_load, spike_amplitude, time_steps=50):
    """
    Models physical grid dampening using y'' + y' + 4y = 0
    Using the method of undetermined coefficients, the roots dictate an underdamped response. 
    Implement the decay factor (0.5) and the oscillation frequency (sqrt(15)/2) so the grid 
    load curve "rings" and exponentially decays back to the baseline_load.
    """
    decay = 0.5
    freq = np.sqrt(15) / 2.0 
    
    # Simulate a time vector (e.g., 10 seconds of recovery)
    t = np.linspace(0, 10, time_steps)
    
    # Underdamped step response formula
    # Rings back down to baseline_load
    curve = baseline_load + spike_amplitude * np.exp(-decay * t) * np.cos(freq * t)
    
    return curve, t

def check_grid_state(baseline_load, spike_load, max_capacity):
    """
    Acts as the Kill Switch. Evaluates total load and triggers math engine if needed.
    """
    total_load = baseline_load + spike_load
    
    if total_load > max_capacity:
        print(f"CRITICAL WARNING: Total Load ({total_load:.2f} MW) exceeded MAX_CAPACITY ({max_capacity} MW).")
        print("TRIGGERING SIGSTOP KILL SWITCH...")
        # Trigger the kill switch and return the recovery curve
        recovery_curve, t_vals = calculate_stabilization_curve(baseline_load, spike_load)
        return True, recovery_curve
    else:
        # Returns a flat line of the stable total load
        return False, np.full(50, total_load)
