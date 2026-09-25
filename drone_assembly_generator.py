import numpy as np
import trimesh
import math
import os

def create_box(extents, translate=(0,0,0), color=None):
    mesh = trimesh.creation.box(extents=extents)
    mesh.apply_translation(translate)
    if color:
        mesh.visual.face_colors = color
    return mesh

def create_cylinder(radius, height, translate=(0,0,0), color=None, transform=None):
    mesh = trimesh.creation.cylinder(radius=radius, height=height)
    if transform is not None:
        mesh.apply_transform(transform)
    mesh.apply_translation(translate)
    if color:
        mesh.visual.face_colors = color
    return mesh

def create_motor(radius, height):
    # Stator / base
    base = create_cylinder(radius=radius, height=height*0.3, translate=(0, 0, height*0.15), color=[50, 50, 50, 255])
    # Bell (rotor)
    bell = create_cylinder(radius=radius*1.05, height=height*0.7, translate=(0, 0, height*0.65), color=[180, 20, 20, 255])
    # Shaft
    shaft = create_cylinder(radius=radius*0.15, height=height*1.5, translate=(0, 0, height*0.75), color=[200, 200, 200, 255])
    return [base, bell, shaft]

def create_propeller(radius):
    # Central hub
    hub = create_cylinder(radius=6, height=5, translate=(0,0,2.5), color=[20,20,20,255])
    # Blades (2 blades)
    blade1 = create_box([radius*2, 12, 1.5], translate=(0, 0, 2.5), color=[30,30,30,200])
    # Apply a slight pitch to the blade for realism
    tf = trimesh.transformations.rotation_matrix(math.radians(15), [1, 0, 0], [0, 0, 2.5])
    blade1.apply_transform(tf)
    return [hub, blade1]

def create_esp32():
    # PCB
    pcb = create_box([52, 28, 1.6], translate=(0, 0, 0.8), color=[30, 30, 30, 255])
    # Shield (ESP-WROOM-32)
    shield = create_box([18, 15, 3], translate=(-12, 0, 1.6 + 1.5), color=[200, 200, 200, 255])
    # Antenna area
    antenna = create_box([6, 15, 1], translate=(-23, 0, 1.6 + 0.5), color=[180, 150, 50, 255])
    # USB port
    usb = create_box([6, 8, 3], translate=(25, 0, 1.6 + 1.5), color=[200, 200, 200, 255])
    return [pcb, shield, antenna, usb]

def create_hcsr04():
    # PCB
    pcb = create_box([45, 20, 1.6], translate=(0, 0, 0.8), color=[20, 50, 150, 255])
    # Cylinders (Tx/Rx)
    tx = create_cylinder(radius=8, height=12, translate=(-12, 0, 1.6 + 6), color=[180, 180, 180, 255])
    rx = create_cylinder(radius=8, height=12, translate=(12, 0, 1.6 + 6), color=[180, 180, 180, 255])
    # Crystal
    crystal = create_box([10, 4, 3], translate=(0, 5, 1.6 + 1.5), color=[150, 150, 150, 255])
    return [pcb, tx, rx, crystal]

def create_camera_module():
    # PCB
    pcb = create_box([25, 24, 1.6], translate=(0, 0, 0.8), color=[20, 150, 20, 255])
    # Lens mount
    mount = create_box([14, 14, 8], translate=(0, 0, 1.6 + 4), color=[20, 20, 20, 255])
    # Lens
    lens = create_cylinder(radius=5, height=2, translate=(0, 0, 1.6 + 8 + 1), color=[10, 10, 30, 255])
    return [pcb, mount, lens]

def create_thermal_camera():
    # PCB
    pcb = create_box([20, 15, 1.6], translate=(0, 0, 0.8), color=[150, 30, 150, 255])
    # Metal can
    can = create_cylinder(radius=4.5, height=4, translate=(0, 0, 1.6 + 2), color=[200, 200, 200, 255])
    # Lens opening
    lens = create_cylinder(radius=2, height=4.1, translate=(0, 0, 1.6 + 2), color=[10, 10, 10, 255])
    return [pcb, can, lens]

def create_imu():
    pcb = create_box([20, 15, 1.6], translate=(0,0,0.8), color=[20, 20, 180, 255])
    chip = create_box([4, 4, 1], translate=(0,0,1.6+0.5), color=[20,20,20,255])
    return [pcb, chip]

def create_battery():
    # 4S LiPo Battery (Blue)
    pack = create_box([80, 34, 30], translate=(0, 0, 0.5), color=[30, 144, 255, 255])
    return [pack]

def main():
    meshes = []
    
    # --- 1. Base Frame ---
    center_plate_extents = [175, 80, 8]
    plate = create_box(center_plate_extents, translate=(0, 0, 4), color=[40, 40, 40, 255])
    meshes.append(plate)
    
    motor_dist = 200 # center to motor distance (extended for longer body)
    arm_width = 18
    arm_height = 8
    
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        arm_length = motor_dist
        # center of arm
        cx = (motor_dist / 2) * math.cos(rad)
        cy = (motor_dist / 2) * math.sin(rad)
        
        # Arm
        arm = create_box([arm_length, arm_width, arm_height], translate=(cx, cy, arm_height/2), color=[50, 50, 50, 255])
        tf_arm = trimesh.transformations.rotation_matrix(rad, [0, 0, 1], [cx, cy, arm_height/2])
        arm.apply_transform(tf_arm)
        meshes.append(arm)
        
        # Motor
        mx = motor_dist * math.cos(rad)
        my = motor_dist * math.sin(rad)
        motor_parts = create_motor(radius=14, height=18)
        for part in motor_parts:
            part.apply_translation((mx, my, arm_height))
        meshes.extend(motor_parts)
        
        # Propeller
        prop_parts = create_propeller(radius=75) # 6 inch props ~ 75mm radius
        for part in prop_parts:
            # spin them slightly depending on motor to look dynamic
            part.apply_transform(trimesh.transformations.rotation_matrix(math.radians(angle * 2), [0,0,1], [0,0,0]))
            part.apply_translation((mx, my, arm_height + 18))
        meshes.extend(prop_parts)
        
        # ESC on arm (Colored bright orange to stand out)
        esc = create_box([32, 16, 6], translate=(cx, cy, arm_height + 3), color=[255, 140, 0, 255])
        esc.apply_transform(tf_arm)
        meshes.append(esc)

    # --- 2. Electronics (With Breadboard) ---
    # Breadboard (Full-size exact dimensions)
    bb_extents = [165, 54.5, 8.5]
    # Base frame top is at Z=8. Breadboard center is 8 + 4.25 = 12.25
    breadboard = create_box(bb_extents, translate=(0, 0, 12.25), color=[240, 240, 240, 255])
    meshes.append(breadboard)
    
    # ESP32-E
    esp_parts = create_esp32()
    # Place ESP32 in the center left, rotated 90 degrees, on top of breadboard (Z=16.5)
    tf_esp = trimesh.transformations.rotation_matrix(math.pi/2, [0,0,1])
    for part in esp_parts:
        part.apply_transform(tf_esp)
        part.apply_translation((-40, 0, 16.5))
    meshes.extend(esp_parts)
    
    # IMU
    imu_parts = create_imu()
    # Place IMU on the right, on top of breadboard (Z=16.5)
    for part in imu_parts:
        part.apply_translation((40, 0, 16.5))
    meshes.extend(imu_parts)

    # --- 3. OnePlus 6 (Exact Real-World Dimensions) ---
    op6_extents = [155.7, 75.4, 7.8]
    # The phone sits directly on top of the ESP32 stack (Z=21.5) perfectly centered at (0,0)
    z_op6 = 21.5 + (op6_extents[2] / 2)
    op6 = create_box(op6_extents, translate=(0, 0, z_op6), color=[10, 10, 10, 255])
    meshes.append(op6)

    # --- 3.5 Battery (Optimal placement: bottom center for low CoG) ---
    battery_parts = create_battery()
    # Bottom of plate is Z=0. Battery center at Z=-15.
    for part in battery_parts:
        part.apply_translation((0, 0, -15.5))
    meshes.extend(battery_parts)

    # --- 4. Sensors ---
    tilt = math.radians(-20) # 20 degree downward tilt for all side sensors
    
    # RGB Camera front facing (Edge right)
    cam_parts = create_camera_module()
    # Rotate to face forward (+X) and tilt up
    tf_cam1 = trimesh.transformations.rotation_matrix(math.pi/2 - tilt, [0,1,0])
    for part in cam_parts:
        part.apply_transform(tf_cam1)
        part.apply_translation((87.5, 30, -5))
    meshes.extend(cam_parts)
    
    # Ultrasonic HC-SR04 (All 4 sides)
    for edge in ['front', 'back', 'left', 'right']:
        us_parts = create_hcsr04()
        tf_us1 = trimesh.transformations.rotation_matrix(math.pi/2, [0,0,1])
        tf_us2 = trimesh.transformations.rotation_matrix(math.pi/2 - tilt, [0,1,0])
        
        dist = 87.5 if edge in ['front', 'back'] else 40.0
        
        yaw = 0
        offset = 0
        if edge == 'back':
            yaw = math.pi
        elif edge == 'left':
            yaw = math.pi/2
            offset = 30
        elif edge == 'right':
            yaw = -math.pi/2
            offset = -30
            
        tf_yaw = trimesh.transformations.rotation_matrix(yaw, [0, 0, 1])
        
        for part in us_parts:
            part.apply_transform(tf_us1)
            part.apply_transform(tf_us2)
            part.apply_translation((dist, offset, -5))
            if yaw != 0:
                part.apply_transform(tf_yaw)
                
        meshes.extend(us_parts)
    
    # Thermal Camera (forward facing - Edge left)
    thm_parts = create_thermal_camera()
    tf_thm = trimesh.transformations.rotation_matrix(math.pi/2 - tilt, [0,1,0])
    for part in thm_parts:
        part.apply_transform(tf_thm)
        part.apply_translation((87.5, -30, -5))
    meshes.extend(thm_parts)

    # Top Ultrasonic Sensor (vertically up) & Phone Clip
    # The clip wraps around the phone (Phone thickness 7.8mm, width 75.4mm)
    # Clip Top Plate
    clip_top = create_box([20, 80, 2], translate=(0, 0, 29.3 + 1), color=[240, 240, 240, 255])
    # Clip Sides
    clip_side1 = create_box([20, 2, 10], translate=(0, 39, 29.3 - 4), color=[240, 240, 240, 255])
    clip_side2 = create_box([20, 2, 10], translate=(0, -39, 29.3 - 4), color=[240, 240, 240, 255])
    meshes.extend([clip_top, clip_side1, clip_side2])

    us_top = create_hcsr04()
    # Point vertically up, sitting on the clip
    for part in us_top:
        part.apply_translation((0, 0, 31.5)) 
    meshes.extend(us_top)

    # --- Assemble & Export ---
    scene = trimesh.Scene(meshes)
    
    # Export to STL (single mesh)
    combined = trimesh.util.concatenate(meshes)
    stl_path = os.path.join(os.path.dirname(__file__), 'drone_assembly.stl')
    combined.export(stl_path)
    print(f"Exported to '{stl_path}'")
    
    # Export to GLB (retains colors, easier to view in 3D viewers)
    glb_path = os.path.join(os.path.dirname(__file__), 'drone_assembly.glb')
    scene.export(glb_path)
    print(f"Exported to '{glb_path}' for colored 3D viewing")

if __name__ == "__main__":
    main()
