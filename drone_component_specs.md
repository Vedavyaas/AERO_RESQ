# Drone Component Technical Specifications

This document outlines the standard real-world technical specifications (specs) for all the hardware components modeled in the drone assembly. 

---

## 1. Frame & Propulsion

| Component | Make / Model | Key Specifications |
| :--- | :--- | :--- |
| **3D Printed Frame** | Custom H-Frame | **Material**: 3D Printed PETG/ABS<br>**Base Plate**: 175mm x 80mm x 8mm thick<br>**Motor Diagonal**: 400mm (Radius = 200mm)<br>**Arm Dimensions**: 200mm (L) x 18mm (W) x 8mm (T) |
| **Brushless Motors** | e.g., 2207 or 2306 | **KV Rating**: ~1700KV (for 6S) to 2400KV (for 4S)<br>**Stator Size**: 22mm (Dia) x 7mm (H)<br>**Mounting Pattern**: 16x16mm (M3) |
| **Propellers** | 6-inch Tri-blade (6040) | **Diameter**: 150mm (Radius 75mm)<br>**Pitch**: 4.0 inches<br>**Material**: Polycarbonate |
| **ESCs** | 4-in-1 or Standalone 40A | **Continuous Current**: 40A per ESC<br>**Burst Current**: 50A (10 seconds)<br>**Protocol**: DSHOT600 / Multishot<br>**Input Voltage**: 3S - 6S LiPo |

---

## 2. Flight Controller & Navigation

| Component | Make / Model | Key Specifications |
| :--- | :--- | :--- |
| **Main Microcontroller** | ESP32-E (WROOM-32) | **Processor**: Xtensa Dual-Core 32-bit LX6 @ 240MHz<br>**Connectivity**: Wi-Fi 802.11 b/g/n, Bluetooth v4.2 BR/EDR & BLE<br>**Operating Voltage**: 3.3V<br>**Interfaces**: I2C, SPI, UART, PWM |
| **Inertial Measurement (IMU)** | MPU6050 Breakout | **Degrees of Freedom**: 6-DoF (3-Axis Gyroscope + 3-Axis Accelerometer)<br>**Communication**: I2C (Up to 400kHz)<br>**Gyro Range**: ±250 to ±2000 °/sec<br>**Accel Range**: ±2g to ±16g |

---

## 3. Sensors & Vision

| Component | Make / Model | Key Specifications |
| :--- | :--- | :--- |
| **Ultrasonic Distance (5x)** | HC-SR04 | **Operating Voltage**: 5V DC<br>**Operating Frequency**: 40kHz<br>**Range**: 2cm to 400cm<br>**Measuring Angle**: 15 degrees |
| **RGB Camera** | Generic 8MP (e.g., Pi Cam V2) | **Sensor**: Sony IMX219 (8-megapixel)<br>**Video Modes**: 1080p30, 720p60, 640x480p90<br>**Interface**: CSI or USB (depending on adapter module) |
| **Thermal Camera** | MLX90640 Breakout | **IR Resolution**: 32 x 24 pixels<br>**Field of View (FOV)**: 55° x 35° or 110° x 75°<br>**Temperature Range**: -40°C to 300°C<br>**Communication**: I2C |

---

## 4. Payload & Peripherals

| Component | Make / Model | Key Specifications |
| :--- | :--- | :--- |
| **Mobile Phone Payload** | OnePlus 6 (A6003) | **Dimensions**: 155.7 x 75.4 x 7.8 mm<br>**Weight**: ~177 grams<br>**Processor**: Qualcomm Snapdragon 845<br>**Battery**: 3300 mAh<br>**Sensors**: GPS, Gyro, Compass, Accel |
| **Prototyping Board** | Standard Full-Size Breadboard| **Dimensions**: 165mm x 54.5mm x 8.5mm<br>**Tie Points**: 830 points (2 power rails, 63 rows)<br>**Pitch**: Standard 2.54mm (0.1 inch) |
