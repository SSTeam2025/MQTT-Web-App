package com.mqtt.web.backend.service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.RescaleOp;

public class Filters {
    public static BufferedImage applyContrast(BufferedImage img, Integer intensity) {
        float factor = (100.0f + intensity) / 100.0f;
        factor *= factor; // crește efectul perceptual

        BufferedImage result = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_RGB);

        for (int y = 0; y < img.getHeight(); y++) {
            for (int x = 0; x < img.getWidth(); x++) {
                Color c = new Color(img.getRGB(x, y));

                int r = clamp((int)(((c.getRed() - 128) * factor) + 128));
                int g = clamp((int)(((c.getGreen() - 128) * factor) + 128));
                int b = clamp((int)(((c.getBlue() - 128) * factor) + 128));

                result.setRGB(x, y, new Color(r, g, b).getRGB());
            }
        }

        return result;
    }

    public static BufferedImage applyBrightness(BufferedImage img, Integer intensity) {
        float offset = (intensity != null ? intensity : 0); // Ex: +40 sau -30
        RescaleOp rescale = new RescaleOp(new float[]{1f, 1f, 1f}, new float[]{offset, offset, offset}, null);
        return rescale.filter(img, null);
    }

    public static BufferedImage applyGrayscalePercentage(BufferedImage original, int intensityPercent) {
        float ratio = Math.max(0, Math.min(100, intensityPercent)) / 100.0f;

        BufferedImage result = new BufferedImage(original.getWidth(), original.getHeight(), BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < original.getHeight(); y++) {
            for (int x = 0; x < original.getWidth(); x++) {
                Color color = new Color(original.getRGB(x, y));
                int gray = (int)(0.3 * color.getRed() + 0.59 * color.getGreen() + 0.11 * color.getBlue());

                int r = (int)(gray * ratio + color.getRed() * (1 - ratio));
                int g = (int)(gray * ratio + color.getGreen() * (1 - ratio));
                int b = (int)(gray * ratio + color.getBlue() * (1 - ratio));

                Color newColor = new Color(clamp(r), clamp(g), clamp(b));
                result.setRGB(x, y, newColor.getRGB());
            }
        }
        return result;
    }

    private static int clamp(int value) {
        return Math.min(255, Math.max(0, value));
    }


}
