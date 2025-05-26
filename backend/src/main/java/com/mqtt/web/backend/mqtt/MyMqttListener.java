package com.mqtt.web.backend.mqtt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivemq.client.mqtt.MqttClient;
import com.hivemq.client.mqtt.datatypes.MqttQos;
import com.hivemq.client.mqtt.mqtt5.Mqtt5AsyncClient;
import com.hivemq.client.mqtt.mqtt5.Mqtt5BlockingClient;
import com.mqtt.web.backend.dtos.ImageUploadRequest;
import com.mqtt.web.backend.model.DeviceEntity;
import com.mqtt.web.backend.model.ImageEntity;
import com.mqtt.web.backend.repository.DeviceRepository;
import com.mqtt.web.backend.repository.ImageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

import static com.hivemq.client.mqtt.MqttGlobalPublishFilter.ALL;

@Component
@RequiredArgsConstructor
public class MyMqttListener {

    private final ImageRepository imageRepository;
    private final DeviceRepository deviceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path uploadDir = Paths.get("uploads/").toAbsolutePath().normalize();

    private final String host = "060d18919ee741d28b9bde954d955e56.s1.eu.hivemq.cloud";
    private final String username = "catalin";
    private final String password = "Mqtt1234!";

    @PostConstruct
    public void init() {
        Mqtt5BlockingClient client = MqttClient.builder()
                .useMqttVersion5()
                .serverHost(host)
                .serverPort(8883)
                .sslWithDefaultConfig()
                .buildBlocking();

        client.connectWith()
                .simpleAuth()
                .username(username)
                .password(StandardCharsets.UTF_8.encode(password))
                .applySimpleAuth()
                .send();

        System.out.println("✅ Conectat la broker MQTT HiveMQ");

        client.subscribeWith()
                .topicFilter("images/+")
                .qos(MqttQos.AT_LEAST_ONCE)
                .send();

        client.subscribeWith()
                .topicFilter("command/+")
                .qos(MqttQos.AT_LEAST_ONCE)
                .send();


        Mqtt5AsyncClient asyncClient = client.toAsync();
        asyncClient.publishes(ALL, publish -> {
            try {
                String topic = publish.getTopic().toString();
                String deviceId = topic.split("/")[1]; // "images/device123" → "device123"
                if (topic.startsWith("images/")) {
                    deviceRepository.findById(deviceId).ifPresent(device -> {
                        device.setStatus("online");
                        deviceRepository.save(device);
                        System.out.println("Device marcat ca online: " + deviceId);
                    });
                }
                // Deconectare dispozitiv -> offline
                if (topic.startsWith("command/")) {
                    String payloadJson = StandardCharsets.UTF_8.decode(publish.getPayload().get()).toString();
                    System.out.println("payloadJson: " + payloadJson);
                    JsonNode node = objectMapper.readTree(payloadJson);

                    if (node.has("command") && node.get("command").asText().equalsIgnoreCase("disconnect")) {
                        deviceRepository.findById(deviceId).ifPresent(device -> {
                            device.setStatus("offline");
                            deviceRepository.save(device);
                            System.out.println("🔴 Device marcat ca offline: " + deviceId);
                        });
                    }

                    return; // nu procesăm mai departe
                }

                // Verifică dacă dispozitivul există în baza de date
                // Dacă nu există, îl adaugă
                // și îl marchează ca online
                if (!deviceRepository.existsById(deviceId)) {
                    DeviceEntity device = new DeviceEntity();
                    device.setDeviceId(deviceId);
                    device.setStatus("online");
                    deviceRepository.save(device);
                    System.out.println("🆕 Device adăugat: " + deviceId);
                }

                // Procesare imagine
                String payloadJson = StandardCharsets.UTF_8.decode(publish.getPayload().get()).toString();
                ImageUploadRequest req = objectMapper.readValue(payloadJson, ImageUploadRequest.class);

                // Redimensionare automată: max 1024x1024 păstrând proporțiile
                byte[] imageBytes = Base64.getDecoder().decode(req.getImageData());
                BufferedImage original = ImageIO.read(new ByteArrayInputStream(imageBytes));
                BufferedImage resized = Thumbnails.of(original).size(1024, 1024).asBufferedImage();

                // Generează nume unic
                String extension = getExtension(req.getFormat());
                String filename = UUID.randomUUID() + "_" + req.getFilename();
                if (!filename.endsWith(extension)) filename += extension;

                // Salvează imaginea redimensionată în uploads/
                Files.createDirectories(uploadDir);
                Path path = uploadDir.resolve(filename);
                ImageIO.write(resized, extension.replace(".", ""), path.toFile());

                ImageEntity image = new ImageEntity();
                image.setFilename(filename);
                image.setFormat(req.getFormat());
                image.setDeviceId(req.getDeviceId());
                image.setUploadDate(LocalDateTime.now());

                imageRepository.save(image);

                System.out.println("📥 Imagine primită de la dispozitiv " + req.getDeviceId() + ": " + filename);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private String getExtension(String format) {
        return switch (format.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            default -> ".bin";
        };
    }
}
