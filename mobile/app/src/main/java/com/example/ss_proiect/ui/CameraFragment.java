package com.example.ss_proiect.ui;

import android.Manifest;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.core.content.res.ResourcesCompat;
import androidx.core.view.ViewCompat;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;

import com.example.ss_proiect.R;
import com.example.ss_proiect.util.MqttSession;
import com.google.common.util.concurrent.ListenableFuture;
import com.hivemq.client.mqtt.datatypes.MqttQos;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class CameraFragment extends Fragment
        implements MqttSession.LiveModeListener, MqttSession.CaptureListener {

    private static final int NORMAL_INTERVAL_SEC = 20;
    private static final int LIVE_INTERVAL_SEC = 5;

    private PreviewView preview;
    private Button backBtn;
    private View marker;
    private TextView resTv;
    private boolean highRes = true;

    private ImageCapture imgCap;
    private ScheduledExecutorService scheduler;
    private ScheduledFuture<?> periodicTask;

    private void updateMarker() {
        int color = ResourcesCompat.getColor(getResources(),
                MqttSession.isLive() ? R.color.marker_red : R.color.marker_grey, null);
        ViewCompat.setBackgroundTintList(marker,
                android.content.res.ColorStateList.valueOf(color));
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater i, @Nullable ViewGroup c, @Nullable Bundle s) {
        return i.inflate(R.layout.fragment_camera, c, false);
    }

    @Override
    public void onViewCreated(@NonNull View v, @Nullable Bundle s) {
        preview = v.findViewById(R.id.cameraPreview);
        backBtn = v.findViewById(R.id.backButton);
        marker = v.findViewById(R.id.liveMarker);
        resTv = v.findViewById(R.id.resIndicator);

        backBtn.setOnClickListener(x ->
                NavHostFragment.findNavController(this).popBackStack());

        marker.setOnClickListener(x ->
                MqttSession.setLive(!MqttSession.isLive()));

        resTv.setOnClickListener(x -> {
            highRes = !highRes;
            resTv.setText(highRes ? "Res: high" : "Res: low");
        });

        updateMarker();

        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            startCam();
        } else {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, 101);
        }
    }

    /*──────── CameraX init ────────*/
    private void startCam() {
        ListenableFuture<ProcessCameraProvider> fut = ProcessCameraProvider.getInstance(requireContext());
        fut.addListener(() -> {
            try {
                ProcessCameraProvider provider = fut.get();
                Preview p = new Preview.Builder().build();
                p.setSurfaceProvider(preview.getSurfaceProvider());

                imgCap = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .build();

                provider.unbindAll();
                provider.bindToLifecycle(getViewLifecycleOwner(),
                        CameraSelector.DEFAULT_BACK_CAMERA, p, imgCap);

                scheduler = Executors.newSingleThreadScheduledExecutor();
                schedulePeriodic();   // start with NORMAL interval

            } catch (Exception ignore) {
            }
        }, ContextCompat.getMainExecutor(requireContext()));
    }

    private void schedulePeriodic() {
        if (periodicTask != null && !periodicTask.isCancelled()) periodicTask.cancel(false);
        int sec = MqttSession.isLive() ? LIVE_INTERVAL_SEC : NORMAL_INTERVAL_SEC;
        periodicTask = scheduler.scheduleAtFixedRate(this::periodicShot, 0, sec, TimeUnit.SECONDS);
    }

    private void periodicShot() {
        boolean live = MqttSession.isLive();
        if (live) {
            captureAndPublish(false, true); // live → NU galerie, topic live
        } else {
            captureAndPublish(true, false); // normal → galerie + topic images
        }
    }

    private void captureAndPublish(boolean saveGallery, boolean forceLiveTopic) {
        if (imgCap == null) return;
        try {
            File tmp = File.createTempFile("cap_", ".jpg", requireContext().getCacheDir());
            ImageCapture.OutputFileOptions opts = new ImageCapture.OutputFileOptions.Builder(tmp).build();

            imgCap.takePicture(opts, Executors.newSingleThreadExecutor(), new ImageCapture.OnImageSavedCallback() {
                @Override
                public void onImageSaved(@NonNull ImageCapture.OutputFileResults r) {
                    Bitmap bmp = decodeScaled(tmp);
                    if (saveGallery) saveToGallery(bmp);
                    String topic = forceLiveTopic ? MqttSession.liveTopic() : MqttSession.normalTopic();
                    publishImage(bmp, topic);
                    tmp.delete();
                }

                @Override
                public void onError(@NonNull ImageCaptureException e) {
                    e.printStackTrace();
                }
            });
        } catch (Exception ignore) {
        }
    }

    private Bitmap decodeScaled(File f) {
        BitmapFactory.Options o = new BitmapFactory.Options();
        o.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(f.getAbsolutePath(), o);
        int target = highRes ? 1024 : 480;
        int sc = 1;
        while (Math.max(o.outWidth, o.outHeight) / sc > target) sc *= 2;
        o.inJustDecodeBounds = false;
        o.inSampleSize = sc;
        return BitmapFactory.decodeFile(f.getAbsolutePath(), o);
    }

    private void saveToGallery(Bitmap bmp) {
        try {
            String name = "IMG_" + System.currentTimeMillis() + ".jpg";
            OutputStream os;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.Images.Media.DISPLAY_NAME, name);
                cv.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                cv.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/imaginiSS");
                Uri uri = requireContext().getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                os = requireContext().getContentResolver().openOutputStream(uri);
            } else {
                File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "imaginiSS");
                if (!dir.exists()) dir.mkdirs();
                os = new FileOutputStream(new File(dir, name));
            }
            bmp.compress(Bitmap.CompressFormat.JPEG, 80, os);
            os.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void publishImage(Bitmap bmp, String topic) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bmp.compress(Bitmap.CompressFormat.JPEG, 65, baos);
        String b64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);

        String device = MqttSession.DEVICE_NAME;
        String timestamp = new java.text.SimpleDateFormat("dd-MM-yy_HH:mm:ss")
                .format(new java.util.Date());
        String filename = device + "_" + timestamp;
        String json = "{\"filename\":\"" + filename + "\"," +
                "\"format\":\"image/jpeg\"," +
                "\"deviceId\":\"" + device + "\"," +
                "\"imageData\":\"" + b64 + "\"}";

        var cl = MqttSession.client(); if (cl == null) return;
        cl.toAsync().publishWith()
                .topic(topic)
                .payload(StandardCharsets.UTF_8.encode(json))
                .qos(MqttQos.AT_LEAST_ONCE)
                .send();
    }

    private void sendDisconnect(){
        var cl = MqttSession.client(); if(cl==null) return;
        String json = "{\"command\":\"disconnect\"}";
        cl.toAsync().publishWith()
                .topic(MqttSession.commandTopic())
                .payload(StandardCharsets.UTF_8.encode(json))
                .qos(MqttQos.AT_LEAST_ONCE)
                .send();
    }

    @Override
    public void onLiveModeChanged(boolean live) {
        requireActivity().runOnUiThread(() -> {
            updateMarker();
            schedulePeriodic();
        });
    }

    @Override
    public void onCaptureRequest() {
        if (!MqttSession.isLive()) captureAndPublish(false, false);
    }

    @Override
    public void onResume() {
        super.onResume();
        MqttSession.addListener(this);
        MqttSession.addCaptureListener(this);
        updateMarker();
    }

    @Override
    public void onPause() {
        super.onPause();
        MqttSession.removeListener(this);
        MqttSession.removeCaptureListener(this);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        sendDisconnect();
        if (scheduler != null) scheduler.shutdownNow();
    }

    @Override
    public void onRequestPermissionsResult(int rq, @NonNull String[] p, @NonNull int[] r) {
        if (rq == 101 && r.length > 0 && r[0] == PackageManager.PERMISSION_GRANTED) startCam();
    }
}
