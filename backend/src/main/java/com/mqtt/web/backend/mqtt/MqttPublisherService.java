package com.mqtt.web.backend.mqtt;

import com.hivemq.client.mqtt.MqttClient;
import com.hivemq.client.mqtt.datatypes.MqttQos;
import com.hivemq.client.mqtt.mqtt5.Mqtt5AsyncClient;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class MqttPublisherService {

    private final Mqtt5AsyncClient client;
    private final String host = "060d18919ee741d28b9bde954d955e56.s1.eu.hivemq.cloud";
    private final String username = "catalin";
    private final String password = "Mqtt1234!";

    public MqttPublisherService() {
        client = MqttClient.builder()
                .useMqttVersion5()
                .serverHost(host) // sau brokerul tău
                .serverPort(8883)
                .sslWithDefaultConfig()
                .buildAsync();

        client.connectWith()
                .simpleAuth()
                .username(username)
                .password(StandardCharsets.UTF_8.encode(password))
                .applySimpleAuth()
                .send();
    }

    public void publishCommand(String deviceId, String action) {
        String topic = "command/" + deviceId;
        String payload = String.format("{\"command\": \"%s\"}",action);

        client.publishWith()
                .topic(topic)
                .qos(MqttQos.AT_LEAST_ONCE)
                .payload(StandardCharsets.UTF_8.encode(payload))
                .send()
                .whenComplete((ack, ex) -> {
                    if (ex != null) ex.printStackTrace();
                    else System.out.println("📡 Command sent to " + deviceId + ": " + action);
                });
    }
}
