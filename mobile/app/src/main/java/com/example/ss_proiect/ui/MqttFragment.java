package com.example.ss_proiect.ui;

import static com.hivemq.client.mqtt.MqttGlobalPublishFilter.ALL;
import static java.nio.charset.StandardCharsets.UTF_8;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;

import com.example.ss_proiect.R;
import com.example.ss_proiect.util.MqttSession;
import com.hivemq.client.mqtt.MqttClient;
import com.hivemq.client.mqtt.datatypes.MqttQos;
import com.hivemq.client.mqtt.mqtt5.Mqtt5BlockingClient;

import org.json.JSONObject;

public class MqttFragment extends Fragment {

    private static final String CMD_START_LIVE = "start_live";
    private static final String CMD_STOP_LIVE = "stop_live";
    private static final String CMD_CAPTURE = "capture";

    // UI
    private EditText hostEdit, userEdit, passEdit;
    private Button connectBtn, navCamBtn;
    private TextView logView;

    // MQTT
    private Mqtt5BlockingClient client;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_mqtt, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View v, @Nullable Bundle savedInstanceState) {
        hostEdit = v.findViewById(R.id.hostEdit);
        userEdit = v.findViewById(R.id.usernameEdit);
        passEdit = v.findViewById(R.id.passwordEdit);

        connectBtn = v.findViewById(R.id.connectButton);
        navCamBtn = v.findViewById(R.id.navCameraButton);
        logView = v.findViewById(R.id.logView);

        connectBtn.setOnClickListener(x -> connect());
        navCamBtn.setOnClickListener(x ->
                NavHostFragment.findNavController(this).navigate(R.id.cameraFragment));
    }

    private void connect() {
        String host = hostEdit.getText().toString().trim();
        String user = userEdit.getText().toString();
        String pass = passEdit.getText().toString();

        append("Connecting …");
        new Thread(() -> {
            try {
                client = MqttClient.builder()
                        .useMqttVersion5()
                        .serverHost(host)
                        .serverPort(8884)
                        .sslWithDefaultConfig()
                        .webSocketConfig()
                        .serverPath("mqtt")
                        .applyWebSocketConfig()
                        .buildBlocking();

                client.connectWith()
                        .simpleAuth()
                        .username(user)
                        .password(UTF_8.encode(pass))
                        .applySimpleAuth()
                        .send();

                client.subscribeWith().topicFilter(MqttSession.commandTopic())
                        .qos(MqttQos.AT_LEAST_ONCE).send();

                requireActivity().runOnUiThread(() -> {
                    append("✓ Connected");
                    navCamBtn.setEnabled(true);
                });

                client.toAsync().publishes(ALL, p -> {

                    if (!p.getPayload().isPresent()) return;

                    String payload = UTF_8.decode(p.getPayload().get()).toString();
                    String t = p.getTopic().toString();

                    if (MqttSession.commandTopic().equals(t)) {
                        try {
                            JSONObject obj = new JSONObject(payload);
                            String cmd = obj.optString("command", "").trim();
                            handleCommand(cmd);
                        } catch (Exception ignore) {
                        }
                    }

                    append("<< " + t + " : " +
                            (payload.length() > 120 ? payload.substring(0, 120) + "…" : payload));
                });

                MqttSession.setClient(client);

            } catch (Exception e) {
                requireActivity().runOnUiThread(() -> append("Err: " + e.getMessage()));
            }
        }).start();
    }

    private void handleCommand(String cmd) {
        switch (cmd.toLowerCase()) {
            case CMD_START_LIVE:
                MqttSession.setLive(true);
                break;
            case CMD_STOP_LIVE:
                MqttSession.setLive(false);
                break;
            case CMD_CAPTURE:
                if (!MqttSession.isLive()) MqttSession.requestCapture();
                break;
        }
    }

    public void append(String txt) {
        if (logView.getText().length() > 10_000)
            logView.setText("");
        logView.append(txt + "\n");

    }
}
