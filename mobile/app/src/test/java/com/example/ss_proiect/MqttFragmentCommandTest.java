package com.example.ss_proiect;

import static org.junit.Assert.*;

import java.lang.reflect.Method;
import java.util.concurrent.atomic.AtomicInteger;

import com.example.ss_proiect.ui.MqttFragment;
import com.example.ss_proiect.util.MqttSession;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE,
        sdk = {34})
public class MqttFragmentCommandTest {

    private Method handleCmd;

    @Before
    public void setUp() throws Exception {
        handleCmd = MqttFragment.class.getDeclaredMethod("handleCommand", String.class);
        handleCmd.setAccessible(true);

        MqttSession.setLive(false);
        var field = MqttSession.class.getDeclaredField("capListeners");
        field.setAccessible(true);
        ((java.util.Collection<?>) field.get(null)).clear();
    }

    private void invoke(MqttFragment f, String cmd) throws Exception {
        handleCmd.invoke(f, cmd);
    }

    @Test
    public void start_and_stop_live_toggle_global_flag() throws Exception {
        MqttFragment frag = new MqttFragment();

        invoke(frag, "start_live");
        assertTrue(MqttSession.isLive());

        invoke(frag, "stop_live");
        assertFalse(MqttSession.isLive());
    }

    @Test
    public void capture_triggers_only_when_not_live() throws Exception {
        MqttFragment frag = new MqttFragment();
        AtomicInteger shots = new AtomicInteger();
        MqttSession.addCaptureListener(shots::incrementAndGet);

        MqttSession.setLive(false);
        invoke(frag, "capture");
        assertEquals(1, shots.get());

        MqttSession.setLive(true);
        invoke(frag, "capture");
        assertEquals(1, shots.get());
    }
}
