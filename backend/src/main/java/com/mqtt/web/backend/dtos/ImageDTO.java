package com.mqtt.web.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Setter
public class ImageDTO {
    String filename;
    String description;
    String deviceId;
    LocalDateTime uploadDate;
    String url;
}
