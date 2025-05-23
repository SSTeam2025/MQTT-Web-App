package com.mqtt.web.backend.dtos;

import lombok.Data;

@Data
public class LiveControlRequest {
    String deviceId;
    String action;

}
