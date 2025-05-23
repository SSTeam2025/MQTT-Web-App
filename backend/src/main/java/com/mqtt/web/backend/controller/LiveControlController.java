package com.mqtt.web.backend.controller;

import com.mqtt.web.backend.dtos.LiveControlRequest;
import com.mqtt.web.backend.mqtt.MqttPublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/live")
@RequiredArgsConstructor
public class LiveControlController {

    private final MqttPublisherService mqttPublisher;

    @PostMapping()
    public ResponseEntity<String> sendLiveCommand(@RequestBody LiveControlRequest request) {
        if (!request.getAction().equals("start_live") && !request.getAction().equals("stop_live")) {
            return ResponseEntity.badRequest().body("Invalid action");
        }

        mqttPublisher.publishCommand(request.getDeviceId(), request.getAction());
        return ResponseEntity.ok("Command sent: " + request.getAction());
    }
}

