package com.mqtt.web.backend.service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.Map;

public class Analysis {

    public static Map<String, int[]> computeHistogram(BufferedImage img) {
        int width = img.getWidth();
        int height = img.getHeight();

        int[] red = new int[256];
        int[] green = new int[256];
        int[] blue = new int[256];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                Color color = new Color(img.getRGB(x, y));
                red[color.getRed()]++;
                green[color.getGreen()]++;
                blue[color.getBlue()]++;
            }
        }

        return Map.of(
                "red", red,
                "green", green,
                "blue", blue
        );
    }


    public static BufferedImage detectEdges(BufferedImage img) {
        int width = img.getWidth();
        int height = img.getHeight();

        BufferedImage edgeImg = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);

        for (int y = 1; y < height - 1; y++) {
            for (int x = 1; x < width - 1; x++) {
                int val00 = new Color(img.getRGB(x - 1, y - 1)).getRed();
                int val01 = new Color(img.getRGB(x, y - 1)).getRed();
                int val02 = new Color(img.getRGB(x + 1, y - 1)).getRed();

                int val10 = new Color(img.getRGB(x - 1, y)).getRed();
                int val12 = new Color(img.getRGB(x + 1, y)).getRed();

                int val20 = new Color(img.getRGB(x - 1, y + 1)).getRed();
                int val21 = new Color(img.getRGB(x, y + 1)).getRed();
                int val22 = new Color(img.getRGB(x + 1, y + 1)).getRed();

                // operator Sobel simplificat (gradient)
                int gx = -val00 - 2 * val10 - val20 + val02 + 2 * val12 + val22;
                int gy = -val00 - 2 * val01 - val02 + val20 + 2 * val21 + val22;

                int g = clamp((int) Math.sqrt(gx * gx + gy * gy));
                Color edgeColor = new Color(g, g, g);
                edgeImg.setRGB(x, y, edgeColor.getRGB());
            }
        }

        return edgeImg;
    }

    private static int clamp(int val) {
        return Math.max(0, Math.min(255, val));
    }

}
