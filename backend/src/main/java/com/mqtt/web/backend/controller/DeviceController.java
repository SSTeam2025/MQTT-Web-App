package com.mqtt.web.backend.controller;

import com.mqtt.web.backend.dtos.DeviceDto;
import com.mqtt.web.backend.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceRepository deviceRepository;

    @GetMapping
    public ResponseEntity<List<DeviceDto>> getAllDevices() {
        List<DeviceDto> devices = deviceRepository.findAll().stream()
                .map(d -> new DeviceDto(d.getDeviceId(), d.getStatus()))
                .toList();

        return ResponseEntity.ok(devices);
    }


}
