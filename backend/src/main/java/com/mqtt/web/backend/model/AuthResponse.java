package com.mqtt.web.backend.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;
    public AuthResponse(String token) { this.token = token; }
}
