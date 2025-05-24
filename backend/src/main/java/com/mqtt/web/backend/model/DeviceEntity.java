package com.mqtt.web.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "devices")
@Getter
@Setter
public class DeviceEntity {
    @Id
    private String deviceId;

    private String status; // "online" sau "registered" sau doar existenta lui
}
