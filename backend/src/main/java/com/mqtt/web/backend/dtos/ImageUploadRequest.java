package com.mqtt.web.backend.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImageUploadRequest {
    String filename;
    String format;
    String deviceId;
    String imageData;
}
