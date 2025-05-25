package com.example.ss_proiect;

import static org.junit.Assert.*;

import android.graphics.Bitmap;

import com.example.ss_proiect.ui.CameraFragment;
import com.example.ss_proiect.util.MqttSession;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import java.io.File;
import java.io.FileOutputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;


@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE,
        sdk = {34})
public class CameraFragmentLogicTest {

    private static <T> T getPrivateField(Object target, String name)
            throws Exception {
        Field f = target.getClass().getDeclaredField(name);
        f.setAccessible(true);
        return (T) f.get(target);
    }

    private static void setPrivateField(Object target, String name, Object value)
            throws Exception {
        Field f = target.getClass().getDeclaredField(name);
        f.setAccessible(true);
        f.set(target, value);
    }

    private static Object callPrivate(Object target, String name, Class<?>[] sig, Object... args)
            throws Exception {
        Method m = target.getClass().getDeclaredMethod(name, sig);
        m.setAccessible(true);
        return m.invoke(target, args);
    }

    @After
    public void tearDown() {
        MqttSession.setClient(null);
    }


    @Test
    public void decodeScaled_obeys_resolution_flags() throws Exception {
        Bitmap big = Bitmap.createBitmap(2000, 1500, Bitmap.Config.ARGB_8888);
        File jpg = File.createTempFile("big_", ".jpg");
        try (FileOutputStream out = new FileOutputStream(jpg)) {
            big.compress(Bitmap.CompressFormat.JPEG, 85, out);
        }

        CameraFragment frag = new CameraFragment();

        Bitmap high = (Bitmap) callPrivate(frag, "decodeScaled",
                new Class[]{File.class}, jpg);
        assertTrue(Math.max(high.getWidth(), high.getHeight()) <= 1024);

        setPrivateField(frag, "highRes", false);
        Bitmap low = (Bitmap) callPrivate(frag, "decodeScaled",
                new Class[]{File.class}, jpg);
        assertTrue(Math.max(low.getWidth(), low.getHeight()) <= 480);
    }

    @Test
    public void publishImage_runs_without_client_and_throws_nothing() throws Exception {
        MqttSession.setClient(null);

        CameraFragment frag = new CameraFragment();
        Bitmap tiny = Bitmap.createBitmap(4, 4, Bitmap.Config.ARGB_8888);

        Method m = CameraFragment.class
                .getDeclaredMethod("publishImage", Bitmap.class, String.class);
        m.setAccessible(true);

        m.invoke(frag, tiny, "any/topic");
    }


    @Test
    public void schedulePeriodic_picks_interval_based_on_live_flag() throws Exception {
        CameraFragment frag = new CameraFragment();

        java.util.concurrent.ScheduledExecutorService exec =
                java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
        setPrivateField(frag, "scheduler", exec);

        MqttSession.setLive(false);
        callPrivate(frag, "schedulePeriodic", new Class[]{});
        var task1 = getPrivateField(frag, "periodicTask");
        assertNotNull(task1);

        MqttSession.setLive(true);
        callPrivate(frag, "schedulePeriodic", new Class[]{});
        var task2 = getPrivateField(frag, "periodicTask");
        assertNotNull(task2);
        assertNotSame(task1, task2);
    }
}
