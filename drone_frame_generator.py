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

def main():
    frame_color = [240, 240, 240, 255]
    
    solid_parts = []
    hole_cutters = []

    # --- 1. Center Base Plate ---
    center_plate_extents = [175, 80, 8]
    plate = create_box(center_plate_extents, translate=(0, 0, 4))
    solid_parts.append(plate)
    
    # Payload mounting holes (4x M3 holes spaced 150x46 for the breadboard stack)
    for sx in [-75, 75]:
        for sy in [-23, 23]:
            cutter = create_cylinder(radius=1.6, height=20, translate=(sx, sy, 4))
            hole_cutters.append(cutter)

    # Battery strap slots (2 pairs of slots for velcro straps)
    for sx in [-20, 20]:
        for sy in [-22, 22]:
            slot_cutter = create_box([20, 4, 20], translate=(sx, sy, 4))
            hole_cutters.append(slot_cutter)

    # --- 2. Arms & Motor Mounts ---
    motor_dist = 200 # extended for the 175mm body
    arm_width = 18
    arm_height = 8
    
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        arm_length = motor_dist
        cx = (motor_dist / 2) * math.cos(rad)
        cy = (motor_dist / 2) * math.sin(rad)
        
        # Arm
        arm = create_box([arm_length, arm_width, arm_height], translate=(cx, cy, arm_height/2))
        tf_arm = trimesh.transformations.rotation_matrix(rad, [0, 0, 1], [cx, cy, arm_height/2])
        arm.apply_transform(tf_arm)
        solid_parts.append(arm)
        
        # Motor Mount Plate (circular pad)
        mx = motor_dist * math.cos(rad)
        my = motor_dist * math.sin(rad)
        motor_pad = create_cylinder(radius=18, height=arm_height, translate=(mx, my, arm_height/2))
        solid_parts.append(motor_pad)
        
        # Motor Screw Holes (4x M3 in 16x16 pattern)
        for sx in [-8, 8]:
            for sy in [-8, 8]:
                screw_hole = create_cylinder(radius=1.6, height=20, translate=(mx+sx, my+sy, arm_height/2))
                hole_cutters.append(screw_hole)
        
        # Center shaft hole for motor
        shaft_hole = create_cylinder(radius=4, height=20, translate=(mx, my, arm_height/2))
        hole_cutters.append(shaft_hole)

        # ESC Mounting/Zip-Tie Holes
        # Two M3 holes spaced 22mm apart along the arm center where the ESC sits
        dx = math.cos(rad)
        dy = math.sin(rad)
        for offset in [-11, 11]:
            esc_hx = cx + (offset * dx)
            esc_hy = cy + (offset * dy)
            esc_hole = create_cylinder(radius=1.6, height=20, translate=(esc_hx, esc_hy, arm_height/2))
            hole_cutters.append(esc_hole)

    # --- 3. Sensor Mount Tabs (Downward Ridge) ---
    tilt = math.radians(-20) # -20 degrees for a downward tilt
    
    def add_sensor_bracket(edge, offset, tab_width, hole_spacing, hole_radius):
        tab = create_box([5, tab_width, 20])
        tf_tab_rot = trimesh.transformations.rotation_matrix(-tilt, [0, 1, 0])
        tab.apply_transform(tf_tab_rot)
        
        parts = [tab]
        half_space = hole_spacing / 2.0
        for offset_y in [-half_space, half_space]:
            screw_hole = create_cylinder(radius=hole_radius, height=20)
            tf_hole_rot1 = trimesh.transformations.rotation_matrix(math.pi/2, [0, 1, 0])
            tf_hole_rot2 = trimesh.transformations.rotation_matrix(-tilt, [0, 1, 0])
            screw_hole.apply_transform(tf_hole_rot1)
            screw_hole.apply_transform(tf_hole_rot2)
            screw_hole.apply_translation((2, offset_y, -5))
            parts.append(screw_hole)
            
        if edge in ['front', 'back']:
            dist = 86
        else:
            dist = 38.5
            
        for p in parts:
            p.apply_translation((dist, offset, -5))
            
        yaw = 0
        if edge == 'back':
            yaw = math.pi
        elif edge == 'left':
            yaw = math.pi/2
        elif edge == 'right':
            yaw = -math.pi/2
            
        if yaw != 0:
            tf_yaw = trimesh.transformations.rotation_matrix(yaw, [0, 0, 1])
            for p in parts:
                p.apply_transform(tf_yaw)
                
        solid_parts.append(parts[0])
        hole_cutters.extend(parts[1:])

    # Ultrasonic (All sides): 45mm width, 40mm hole spacing, M3 hole (1.6mm radius)
    add_sensor_bracket('front', 0, 45, 40, 1.6)
    add_sensor_bracket('back', 0, 45, 40, 1.6)
    add_sensor_bracket('left', 30, 45, 40, 1.6)
    add_sensor_bracket('right', -30, 45, 40, 1.6)
    
    # RGB Camera (Right Y=30): 25mm width, 21mm hole spacing, M2 hole (1.1mm radius - tolerance)
    add_sensor_bracket('front', 30, 25, 21, 1.1)
    
    # Thermal Camera (Left Y=-30): 25mm width, 20mm hole spacing, M2.5 hole (1.35mm radius - tolerance)
    add_sensor_bracket('front', -30, 25, 20, 1.35)

    # --- 4. Phone Clip for Top Sensor (Prints next to the frame) ---
    # Removed as requested.

    # --- Assemble & Cut Holes ---
    base_mesh = trimesh.util.concatenate(solid_parts)
    cutters_mesh = trimesh.util.concatenate(hole_cutters)
    
    try:
        final_mesh = base_mesh.difference(cutters_mesh)
        if final_mesh.is_empty:
            print("Boolean difference returned empty mesh. Falling back.")
            final_mesh = base_mesh
        else:
            print("Successfully cut boolean holes using manifold3d!")
    except Exception as e:
        print(f"Boolean difference failed: {e}. Falling back.")
        final_mesh = base_mesh

    if hasattr(final_mesh.visual, 'face_colors'):
        final_mesh.visual.face_colors = frame_color

    # --- Export ---
    scene = trimesh.Scene([final_mesh])
    
    stl_path = os.path.join(os.path.dirname(__file__), 'drone_frame_printable.stl')
    final_mesh.export(stl_path)
    print(f"Exported bare frame to '{stl_path}'")
    
    glb_path = os.path.join(os.path.dirname(__file__), 'drone_frame_printable.glb')
    scene.export(glb_path)
    print(f"Exported bare frame to '{glb_path}'")

if __name__ == "__main__":
    main()
