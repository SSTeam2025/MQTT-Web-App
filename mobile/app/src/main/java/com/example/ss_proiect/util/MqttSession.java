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
    private static final String NORMAL_TOPIC = "images/" + DEVICE_NAME;
    private static final String LIVE_TOPIC = "live/" + DEVICE_NAME;

    public static String normalTopic() {
        return NORMAL_TOPIC;
    }

    public static String liveTopic() {
        return LIVE_TOPIC;
    }

    public static String commandTopic() {
        return COMMAND_TOPIC;
    }

    public static String deviceName(){
        return DEVICE_NAME;
    }

    public static void setClient(Mqtt5BlockingClient c) {
        client = c;
    }

    public static Mqtt5BlockingClient client() {
        return client;
    }

    private static final AtomicBoolean LIVE = new AtomicBoolean(false);

    public static boolean isLive() {
        return LIVE.get();
    }

    public static void setLive(boolean value) {
        if (LIVE.getAndSet(value) != value) {
            for (LiveModeListener l : listeners) {
                l.onLiveModeChanged(value);
            }
        }
    }

    private static final CopyOnWriteArrayList<CaptureListener> capListeners = new CopyOnWriteArrayList<>();

    public interface LiveModeListener {
        void onLiveModeChanged(boolean isLive);
    }

    public interface CaptureListener {
        void onCaptureRequest();
    }

    private static final CopyOnWriteArrayList<LiveModeListener> listeners = new CopyOnWriteArrayList<>();

    public static void addListener(LiveModeListener l) {
        listeners.addIfAbsent(l);
    }

    public static void removeListener(LiveModeListener l) {
        listeners.remove(l);
    }

    public static void addCaptureListener(CaptureListener l) {
        capListeners.addIfAbsent(l);
    }

    public static void removeCaptureListener(CaptureListener l) {
        capListeners.remove(l);
    }

    public static void requestCapture() {
        capListeners.forEach(CaptureListener::onCaptureRequest);
    }
}