# ⚡ Grid-Guard: Automated Compute-Throttling System

**Grid-Guard** is a software proof-of-concept developed for a 2-hour energy hackathon. It focuses on the ERCOT (Texas) power grid and simulates the catastrophic impact of Large Electronic Loads (AI Data Centers) spinning up during extreme weather events. 

The system acts as a "Kill Switch," deploying a lightweight machine learning predictor to forecast baseline demand, simulating the instant load spike of a sprawling GPU cluster, and mathematically forcing the grid to stabilize using algorithmic power throttling.

---

## 🚀 Key Features

### 1. The Predictive Brain (ARIMA)
Grid-Guard trains a lightweight `pmdarima` model on historic ERCOT data (2021-2024). It ingests 24-day lag features and exogenous weather variables (Wind Speed, Precipitation, Snow Depth, Max/Min Temp). 
* **Dynamic AI Load:** The model dynamically predicts a data center's Power Usage Effectiveness (PUE) based on the modeled `TMAX` (outside temperature). When Texas hits 105°F, the chillers work harder, and the AI load exponentially increases!

### 2. The Load Simulator & Control Loop
The physical simulation tracks the combined "Attempted Demand" of the grid baseline plus the Data Center. 
* **The Kill Switch:** It continuously monitors the combined load against a `MAX_SAFE_CAPACITY` threshold. If breached, the system triggers a simulated `SIGSTOP` event.

### 3. Mathematical Grid Stabilization (The Math Flex)
When massive power is suddenly cut, the grid "rings." Grid-Guard physically dampens this shock by modeling a second-order linear differential equation ($y'' + y' + 4y = 0$). Using the method of undetermined coefficients, an underdamped harmonic formula guarantees rapid settling time to safely ground the grid.

### 4. Real-Time Streamlit Dashboard
The entire simulation is wrapped inside an interactive Streamlit UI (`app.py`), animating live incoming grid data and visually highlighting the gap between "Attempted Demand" and the "Throttled Grid Supply" preventing rolling blackouts.

---

## 🛠️ Project Structure

*   `app.py` - The main Streamlit dashboard serving the UI and orchestrating the live simulation loop.
*   `model_brain.py` - Trains the `pmdarima` model and contains the dynamic `predict_ai_pue()` algorithm.
*   `simulation.py` - Houses the `check_grid_state()` threshold detection and the `calculate_stabilization_curve()` math logic.
*   `data_pipeline.py` - Cleans and merges raw historical load, weather, and outage Excel files into the matrix (X, y) used for the Predictive Brain.
*   `main.py` - A standalone static simulation (Arjun's module) focusing purely on Austin Energy constraints, exporting an outage tracker.
*   `Grid_Research.ipynb` - The original data engineering investigation that built the foundation for `data_pipeline.py`.

---

## ⚙️ Installation & Usage

**1. Install Dependencies**
```bash
pip install pandas numpy pmdarima streamlit matplotlib
```

**2. Run the Dashboard**
```bash
streamlit run app.py
```

**3. Run Static Analysis (Austin Specific)**
```bash
python main.py
```

---
*Built rapidly using pandas, pmdarima, numpy, and streamlit.*