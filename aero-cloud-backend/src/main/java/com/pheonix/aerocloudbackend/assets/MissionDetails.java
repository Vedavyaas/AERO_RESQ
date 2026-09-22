package com.pheonix.aerocloudbackend.assets;

public record MissionDetails(String missionName, Long droneId, String latitude, String longitude, String altitude, RiskStatus riskStatus) {
}