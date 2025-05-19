package com.example.ss_proiect;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import com.hivemq.client.mqtt.MqttClient;
import com.hivemq.client.mqtt.datatypes.MqttQos;
import com.hivemq.client.mqtt.mqtt5.Mqtt5BlockingClient;

import static com.hivemq.client.mqtt.MqttGlobalPublishFilter.ALL;
import static java.nio.charset.StandardCharsets.UTF_8;

public class MainActivity extends AppCompatActivity {

    private EditText hostEdit, userEdit, passEdit, topicEdit, msgEdit;
    private Button connectBtn, sendBtn;
    private TextView logView;
    private Mqtt5BlockingClient client;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        hostEdit   = findViewById(R.id.hostEdit);
        userEdit   = findViewById(R.id.usernameEdit);
        passEdit   = findViewById(R.id.passwordEdit);
        topicEdit  = findViewById(R.id.topicEdit);
        msgEdit    = findViewById(R.id.messageEdit);
        connectBtn = findViewById(R.id.connectButton);
        sendBtn    = findViewById(R.id.sendButton);
        logView    = findViewById(R.id.logView);

        sendBtn.setEnabled(false);

        connectBtn.setOnClickListener(v -> connect());
        sendBtn.setOnClickListener(v -> publish());
    }

    private void connect() {
        final String host = hostEdit.getText().toString().trim();
        final String user = userEdit.getText().toString();
        final String pass = passEdit.getText().toString();
        final String topic = topicEdit.getText().toString().trim();

        appendLog("Connecting to " + host + " …");
        new Thread(() -> {
            try {
                client = MqttClient.builder()
                        .useMqttVersion5()
                        .serverHost(host)
                        .serverPort(8884)          // TLS WebSocket port
                        .sslWithDefaultConfig()    // activează TLS
                        .webSocketConfig()         // folosește WS
                        .serverPath("mqtt")    // /mqtt conform HiveMQ Cloud
                        .applyWebSocketConfig()
                        .buildBlocking();

                client.connectWith()
                        .simpleAuth()
                        .username(user)
                        .password(UTF_8.encode(pass))
                        .applySimpleAuth()
                        .send();

                runOnUiThread(() -> {
                    appendLog("✓ Connected");
                    sendBtn.setEnabled(true);
                });

                // subscribe
                client.subscribeWith()
                        .topicFilter(topic)
                        .qos(MqttQos.EXACTLY_ONCE)
                        .send();

                // callback pentru mesaje primite
                client.toAsync().publishes(ALL, pub -> {
                    String body = UTF_8.decode(pub.getPayload().get()).toString();
                    appendLog("<< " + pub.getTopic() + " : " + body);
                });

            } catch (Exception e) {
                runOnUiThread(() -> appendLog("Connect error: " + e.getMessage()));
            }
        }).start();
    }

    private void publish() {
        final String topic = topicEdit.getText().toString().trim();
        final String msg   = msgEdit.getText().toString();
        new Thread(() -> {
            try {
                client.publishWith()
                        .topic(topic)
                        .payload(UTF_8.encode(msg))
                        .qos(MqttQos.EXACTLY_ONCE)
                        .send();
                runOnUiThread(() -> appendLog("-> " + topic + " : " + msg));
            } catch (Exception e) {
                runOnUiThread(() -> appendLog("Publish error: " + e.getMessage()));
            }
        }).start();
    }

    private void appendLog(String l) { runOnUiThread(() -> logView.append(l + "\n")); }

    @Override protected void onDestroy() {
        super.onDestroy();
        if (client != null) new Thread(() -> client.disconnect()).start();
    }
}
