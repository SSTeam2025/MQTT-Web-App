package com.mqtt.web.backend.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimpleFilterRequest {
    String filename;
    int contrast;     // ex: -100 → +100
    int brightness;
    int grayscale;
}
