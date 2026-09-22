package com.pheonix.aerocloudbackend.assets;

public record MissionDTO(Long id, String missionName, String droneCode, String latitude, String longitude, String altitude, RiskStatus riskStatus, MissionStatus missionStatus) {
}
