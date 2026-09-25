# Drone Frame Dimensions

This document details the precise physical dimensions of the bare drone frame structure, required for manufacturing (e.g., 3D printing with PETG/PLA or CNC routing).

## Overall Structural Dimensions
| Component | Dimension (X / Length) | Dimension (Y / Width) | Dimension (Z / Thickness) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Center Base Plate** | `175.0 mm` | `80.0 mm` | `15.0 mm` | The main "bus" body. |
| **Motor-to-Motor Diagonal** | `400.0 mm` | `400.0 mm` | N/A | Total diagonal distance between opposite motors (radius is 200mm). |
| **Arms (4x)** | `200.0 mm` | `18.0 mm` | `15.0 mm` | Distance measured from dead center `(0,0)` to the motor shaft. |
| **Motor Mounting Pads** | `36.0 mm` (Diameter)| `36.0 mm` (Diameter)| `15.0 mm` | Circular pads at the end of each arm. |

## Mounting Hardware & Hole Patterns

### Electronics Stack (Payload)
*   **Spacing**: `150.0 mm` (X-axis) by `46.0 mm` (Y-axis).
*   **Hole Locations**: 
    *   Top-Left: `(-75, 23)`
    *   Top-Right: `(75, 23)`
    *   Bottom-Left: `(-75, -23)`
    *   Bottom-Right: `(75, -23)`
*   **Hole Diameter**: `3.2 mm` (Standard clearance for M3 screws).

### Motor Mounts
*   **Pattern**: `16.0 mm x 16.0 mm` square pattern.
*   **Hole Locations (Relative to motor center)**: `(-8, 8)`, `(8, 8)`, `(-8, -8)`, `(8, -8)`.
*   **Screw Hole Diameter**: `3.2 mm` (M3 clearance).
*   **Center Shaft Clearance Hole**: `8.0 mm` diameter.

### Side Sensor Brackets (4x)
*   **Locations**: Front/Back at `X = ±87.5 mm`, Left/Right at `X = -30.0 mm, Y = ±40.0 mm`.
*   **Bracket Dimensions**: `5 mm` (Thickness) x `45 mm` (Width) x `20 mm` (Drop).
*   **Sensor Tilt Angle**: `20 Degrees` downwards (Pitch).

### Top Sensor Bridge
*   **Pillars (2x)**: Located at `X = 82 mm` (front) and `X = -82 mm` (back) on center line `Y = 0`.
*   **Beam**: Spans from `X = -82 mm` to `X = 82 mm` at `Z = 34 mm` height, clearing the phone payload.
*   **Sensor Location**: Dead center at `(0, 0, 35 mm)`, perfectly balanced for CoG.
