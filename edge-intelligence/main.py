import configparser
import os
import time
import random
import threading
import requests
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from api_client import ApiClient

app = Flask(__name__)

# Global state for the Edge Intelligence Module
telemetry_buffer = []
simulation_active = False
mission_target = None
api_client = None

def simulation_loop():
    """
    Background thread that simulates flight and sends telemetry
    when a mission is active.
    """
    global simulation_active, mission_target, api_client
    print("Simulation thread started, waiting for mission to be initiated...")
    
    path_step = 0
    GRID_SIZE = 10 # 10x10 grid of points
    STEP_DISTANCE = 0.0001 # Roughly 10 meters between points

    while True:
        if not simulation_active or not mission_target:
            time.sleep(1)
            path_step = 0 # reset path when waiting
            continue
            
        base_lat = float(mission_target.get('latitude', 34.0522))
        base_lon = float(mission_target.get('longitude', -118.2437))
        
        # Calculate row and column for the grid
        row = (path_step // GRID_SIZE) % GRID_SIZE
        col = path_step % GRID_SIZE
        
        # Snake pattern (lawnmower): reverse direction on odd rows
        if row % 2 == 1:
            col = (GRID_SIZE - 1) - col
            
        # Place dots perfectly in a grid without jitter to form a solid block
        current_lat = base_lat + (row * STEP_DISTANCE) - (GRID_SIZE * STEP_DISTANCE / 2)
        current_lon = base_lon + (col * STEP_DISTANCE) - (GRID_SIZE * STEP_DISTANCE / 2)
        
        # Simulate a structural gap cluster exactly in the middle of the block
        gap_found = False
        if 4 <= row <= 5 and 4 <= col <= 5: # A 2x2 cluster in the middle
            gap_found = True
            
        # Generate clean, stable metrics for the block
        temp = 25.0
        prob = 0.0
        if gap_found:
            temp = 65.0   # Solid thermal spike
            prob = 0.95   # High survivor probability
            
        # 1. Generate sample drone statistics data based on the grid block
        sample_data = {
            "droneCode": api_client.drone_code,
            "latitude": current_lat,
            "longitude": current_lon,
            "altitude": float(mission_target.get('altitude', 150.0)),
            "temperature": temp,
            "survivorProbability": prob,
            "structuralGapFound": gap_found,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        path_step += 1
        
        # Add new data to the buffer
        telemetry_buffer.append(sample_data)
        
        # 2. Attempt to send all buffered data ONLY if we have at least 5 readings
        if len(telemetry_buffer) >= 5:
            try:
                print(f"[{sample_data['timestamp']}] Batch threshold reached. Sending {len(telemetry_buffer)} telemetry readings...")
                api_client.send_batch_telemetry(telemetry_buffer)
                print(" -> Success")
                telemetry_buffer.clear()
                
            except requests.exceptions.RequestException as e:
                # Catch connection errors (e.g., ConnectionError, Timeout)
                print(f" -> No connectivity. Keeping {len(telemetry_buffer)} readings in buffer. (Error: {type(e).__name__})")
            except Exception as e:
                # Catch other generic errors without clearing the buffer
                print(f" -> Failed to send due to unexpected error: {e}")
        else:
            print(f"[{sample_data['timestamp']}] Collected reading. Buffer size: {len(telemetry_buffer)}/5")
        
        # Wait for 1 second before generating the next reading
        time.sleep(1)

@app.route('/initiate', methods=['POST'])
def initiate_mission():
    """
    Endpoint called by the backend to initiate the drone mission.
    Expects latitude, longitude, and altitude as query parameters.
    """
    global simulation_active, mission_target
    
    lat = request.args.get('latitude')
    lon = request.args.get('longitude')
    alt = request.args.get('altitude')
    
    print(f"\n[RECEIVED] Mission Initiated by backend!")
    print(f"Target coordinates decoded: Lat={lat}, Lon={lon}, Alt={alt}\n")
    
    mission_target = {
        'latitude': lat or 0.0,
        'longitude': lon or 0.0,
        'altitude': alt or 0.0
    }
    
    # Start the simulation loop if it wasn't running
    simulation_active = True
    
    return jsonify({"status": "success", "message": "Mission initiated successfully"}), 200

def main():
    global api_client
    
    # Load configuration from config.properties
    config = configparser.ConfigParser()
    config_path = os.path.join(os.path.dirname(__file__), "config.properties")
    config.read(config_path)
    
    # Extract values from DEFAULT section
    backend_url = config.get("DEFAULT", "backend_url", fallback="http://localhost:8080/api/hardware")
    drone_code = config.get("DEFAULT", "drone_code", fallback="DRONE-001")
    
    # Initialize the API client with the dynamic URL and drone code
    api_client = ApiClient(base_url=backend_url, drone_code=drone_code)
    
    print(f"==========================================")
    print(f"Edge Intelligence Module Started")
    print(f"==========================================")
    print(f"Connecting to Backend : {api_client.base_url}")
    print(f"Using Drone Code      : {api_client.drone_code}")
    print(f"Listening on port     : 8000 (for /initiate)")
    print(f"==========================================")
    
    # Start the simulation thread in the background as a daemon thread
    threading.Thread(target=simulation_loop, daemon=True).start()
    
    # Start the Flask HTTP server to listen for the backend's /initiate request
    # host='0.0.0.0' exposes it to the network, port 8000 matches backend config
    app.run(host='0.0.0.0', port=8000, use_reloader=False)

if __name__ == "__main__":
    main()
