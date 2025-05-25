package com.example.ss_proiect;

import static org.junit.Assert.*;

import com.example.ss_proiect.util.MqttSession;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE,
        sdk = {34})
public class MqttSessionTest {


    private void clearListeners() {
        try {
            var f1 = MqttSession.class.getDeclaredField("listeners");
            f1.setAccessible(true);
            ((java.util.Collection<?>) f1.get(null)).clear();

            var f2 = MqttSession.class.getDeclaredField("capListeners");
            f2.setAccessible(true);
            ((java.util.Collection<?>) f2.get(null)).clear();
        } catch (Exception ignored) {}
    }

    @After
    public void tearDown() {
        MqttSession.setLive(false);
        clearListeners();
    }

    @Test
    public void topics_match_deviceName() {
        String dev = MqttSession.deviceName();
        assertEquals("images/"  + dev, MqttSession.normalTopic());
        assertEquals("live/"    + dev, MqttSession.liveTopic());
        assertEquals("command/" + dev, MqttSession.commandTopic());
    }

    @Test
    public void setLive_flips_state_and_notifies_once() {
        AtomicInteger hits = new AtomicInteger();
        MqttSession.addListener(isLive -> hits.incrementAndGet());

        boolean start = MqttSession.isLive();
        MqttSession.setLive(!start);
        assertEquals(!start, MqttSession.isLive());
        assertEquals(1, hits.get());

        MqttSession.setLive(!start);
        assertEquals(1, hits.get());
    }

    @Test
    public void requestCapture_notifies_all_registered_listeners() {
        AtomicInteger hits = new AtomicInteger();
        MqttSession.addCaptureListener(hits::incrementAndGet);
        MqttSession.addCaptureListener(hits::incrementAndGet);

        MqttSession.requestCapture();
        assertEquals(2, hits.get());
    }
}
