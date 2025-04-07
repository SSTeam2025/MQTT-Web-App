package com.mqtt.web.backend.model;

import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class AuthRequest {
    private String username;
    private String password;

}