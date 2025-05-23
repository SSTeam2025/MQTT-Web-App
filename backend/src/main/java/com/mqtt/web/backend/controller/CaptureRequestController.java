package com.mqtt.web.backend.controller;

import com.mqtt.web.backend.mqtt.MqttPublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/capture")
@RequiredArgsConstructor
public class CaptureRequestController {

    private final MqttPublisherService mqttPublisher;

    @PostMapping()
    public ResponseEntity<String> requestCapture(@RequestParam String deviceId) {
        mqttPublisher.publishCommand(deviceId, "capture");
        return ResponseEntity.ok("✅ Comandă trimisă către device: " + deviceId);
    }
}
