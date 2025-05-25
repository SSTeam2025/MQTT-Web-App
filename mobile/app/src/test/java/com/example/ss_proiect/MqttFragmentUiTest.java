package com.example.ss_proiect;

import static org.junit.Assert.*;

import android.widget.Button;
import android.widget.TextView;

import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentTransaction;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.android.controller.ActivityController;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLooper;

import com.example.ss_proiect.ui.MqttFragment;

import java.util.Objects;

@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE,
        sdk = {34})
public class MqttFragmentUiTest {

    private ActivityController<FragmentActivity> activityCtl;
    private FragmentActivity                     activity;
    private MqttFragment                          fragment;

    @Before
    public void setUp() {
        activityCtl = Robolectric.buildActivity(FragmentActivity.class)
                .create()
                .start()
                .resume();
        activity = activityCtl.get();

        fragment = new MqttFragment();
        FragmentTransaction tx = activity.getSupportFragmentManager()
                .beginTransaction()
                .add(android.R.id.content, fragment, "TAG");
        tx.commitNow();
    }

    @After
    public void tearDown() {
        activityCtl.pause().stop().destroy();
    }

    @Test
    public void append_appends_text_and_grows_length() {
        TextView log = Objects.requireNonNull(fragment.getView()).findViewById(R.id.logView);

        fragment.append("hello");
        ShadowLooper.runUiThreadTasksIncludingDelayedTasks();
        assertTrue(log.getText().toString().contains("hello"));

        String big = "x".repeat(10_500);
        fragment.append(big);
        ShadowLooper.runUiThreadTasksIncludingDelayedTasks();

        String text = log.getText().toString();
        assertTrue(text.endsWith(big + "\n"));
        assertEquals(6 + big.length() + 1, text.length());
    }

    @Test
    public void navCamButton_starts_disabled() {
        Button camBtn = Objects.requireNonNull(fragment.getView()).findViewById(R.id.navCameraButton);
        assertFalse(camBtn.isEnabled());
    }
}
