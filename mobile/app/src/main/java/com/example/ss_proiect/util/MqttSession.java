package com.example.ss_proiect.util;

import android.os.Build;

import com.hivemq.client.mqtt.mqtt5.Mqtt5BlockingClient;

import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;

public final class MqttSession {

    private MqttSession() {  }

    private static Mqtt5BlockingClient client;

    public static final String DEVICE_NAME = Build.MODEL.replaceAll("\\s+", "_");
    private static final String COMMAND_TOPIC = "command/" + DEVICE_NAME;
    public static String commandTopic() {
        return COMMAND_TOPIC;
    }

    public static void setClient(Mqtt5BlockingClient c) {
        client = c;
    }

    private static final AtomicBoolean LIVE = new AtomicBoolean(false);

    public static void setLive(boolean value) {
        if (LIVE.getAndSet(value) != value) {
            for (LiveModeListener l : listeners) l.onLiveModeChanged(value);
        }
    }

    public interface LiveModeListener {
        void onLiveModeChanged(boolean isLive);
    }

    private static final CopyOnWriteArrayList<LiveModeListener> listeners = new CopyOnWriteArrayList<>();

}