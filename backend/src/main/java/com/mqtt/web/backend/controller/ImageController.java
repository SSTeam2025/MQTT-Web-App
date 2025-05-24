package com.mqtt.web.backend.controller;

import com.mqtt.web.backend.dtos.ImageDTO;
import com.mqtt.web.backend.dtos.ImageUploadRequest;
import com.mqtt.web.backend.dtos.SimpleFilterRequest;
import com.mqtt.web.backend.model.ImageEntity;
import com.mqtt.web.backend.repository.ImageRepository;
import com.mqtt.web.backend.service.Analysis;
import com.mqtt.web.backend.service.Filters;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/images")
public class ImageController {

    private final Path uploadDir = Paths.get("uploads/").toAbsolutePath().normalize();

    private final ImageRepository imageRepository;

    public ImageController(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestBody ImageUploadRequest request) {
        try {
            // Decodează Base64
            byte[] imageBytes = Base64.getDecoder().decode(request.getImageData());
            String extension = getExtensionFromFormat(request.getFormat());

            // Citește imaginea într-un BufferedImage
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (originalImage == null) {
                return ResponseEntity.badRequest().body("Fișierul nu este o imagine validă.");
            }

            // Redimensionare automată: max 1024x1024 păstrând proporțiile
            BufferedImage resizedImage = Thumbnails.of(originalImage)
                    .size(1024, 1024)
                    .outputQuality(0.85) // opțional, pentru JPEG
                    .asBufferedImage();

            // Generează nume unic
            String filename = UUID.randomUUID() + "_" + request.getFilename();
            if (!filename.endsWith(extension)) {
                filename += extension;
            }

            // Salvează imaginea redimensionată în uploads/
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(filename);
            ImageIO.write(resizedImage, extension.replace(".", ""), filePath.toFile());

            // Salvează metadatele în DB
            ImageEntity entity = new ImageEntity();
            entity.setFilename(filename);
            entity.setDeviceId(request.getDeviceId());
            entity.setUploadDate(LocalDateTime.now());
            entity.setFormat(request.getFormat());

            imageRepository.save(entity);

            return ResponseEntity.ok("Imagine salvată și redimensionată cu succes: " + filename);

        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Eroare la salvare/redimensionare: " + e.getMessage());
        }
    }

    private String getExtensionFromFormat(String format) {
        return switch (format.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpeg";
            case "image/jpg" -> ".jpg";
            case "image/heic" -> ".heic";
            default -> ".bin";
        };
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        // Previne accesul la alte fișiere de pe disc
        Path filePath = uploadDir.resolve(filename).normalize();

        if (!filePath.startsWith(uploadDir)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Verifică dacă fișierul există
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Detectează tipul MIME (image/jpeg, image/png etc.)
        MediaType mediaType = MediaTypeFactory.getMediaType(String.valueOf(filePath))
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }

    @GetMapping
    public ResponseEntity<List<ImageDTO>> getAllImages() {
        List<ImageEntity> images = imageRepository.findAll();
        return ResponseEntity.ok(images.stream().map(this::toDTO).toList());
    }

    @GetMapping("/{deviceId}/latest")
    public ResponseEntity<org.springframework.core.io.Resource> getLatestImageFile(@PathVariable String deviceId) {
        return imageRepository.findTopByDeviceIdOrderByUploadDateDesc(deviceId)
                .map(image -> {
                    try {
                        Path filePath = Paths.get("uploads").resolve(image.getFilename()).normalize();
                        org.springframework.core.io.Resource resource = new UrlResource(filePath.toUri());

                        if (!resource.exists()) {
                            return ResponseEntity.notFound().<org.springframework.core.io.Resource>build();
                        }

                        MediaType contentType = getMediaType(image.getFormat());

                        return ResponseEntity.ok()
                                .contentType(contentType)
                                .body(resource);

                    } catch (Exception e) {
                        return ResponseEntity.internalServerError().<org.springframework.core.io.Resource>build();
                    }
                })
                .orElse(ResponseEntity.notFound().<org.springframework.core.io.Resource>build());
    }

    private MediaType getMediaType(String format) {
        return switch (format.toLowerCase()) {
            case "image/jpeg", "jpeg", "jpg" -> MediaType.IMAGE_JPEG;
            case "image/png", "png" -> MediaType.IMAGE_PNG;
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
    @GetMapping("/filter")
    public ResponseEntity<List<ImageDTO>> filterImages(
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        List<ImageEntity> results;

        if (deviceId != null && from != null && to != null) {
            results = imageRepository.findByDeviceIdAndUploadDateBetween(deviceId, from, to);
        } else if (deviceId != null) {
            results = imageRepository.findByDeviceId(deviceId);
        } else if (from != null && to != null) {
            results = imageRepository.findByUploadDateBetween(from, to);
        } else {
            results = imageRepository.findAll();
        }

        return ResponseEntity.ok(results.stream().map(this::toDTO).toList());
    }

    @GetMapping("/filterByDevice")
    public ResponseEntity<List<ImageDTO>> filterImages(
            @RequestParam(required = false) String deviceId
            ) {
        List<ImageEntity> results;
        if (deviceId != null) {
            results = imageRepository.findByDeviceId(deviceId);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(results.stream().map(this::toDTO).toList());
    }

    private ImageDTO toDTO(ImageEntity image) {
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/images/")
                .path(image.getFilename())
                .toUriString();

        return new ImageDTO(
                image.getFilename(),
                image.getDescription(),
                image.getDeviceId(),
                image.getUploadDate(),
                url
        );
    }

    @PostMapping("/apply-filters")
    public ResponseEntity<Map<String, String>> applySimpleFilters(@RequestBody SimpleFilterRequest request) {
        try {
            Path inputPath = uploadDir.resolve(request.getFilename()).normalize();
            if (!Files.exists(inputPath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Imaginea originală nu există."));
            }

            BufferedImage image = ImageIO.read(inputPath.toFile());
            if (image == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Fișierul nu e imagine validă."));
            }

            // Aplică filtrele dacă sunt setate
            if (request.getGrayscale() != 0) {
                image = Filters.applyGrayscalePercentage(image, request.getGrayscale());
            }
            if (request.getContrast() != 0) {
                image = Filters.applyContrast(image, request.getContrast());
            }
            if (request.getBrightness() != 0) {
                image = Filters.applyBrightness(image, request.getBrightness());
            }

            String extension = getExtensionFromFilename(request.getFilename());
            String newFilename = "filtered_" + UUID.randomUUID() + extension;
            Path outputPath = uploadDir.resolve(newFilename);
            ImageIO.write(image, extension.replace(".", ""), outputPath.toFile());

            // Salvează metadatele
            ImageEntity entity = new ImageEntity();
            entity.setFilename(newFilename);
            entity.setFormat("image/" + extension.replace(".", ""));
            entity.setDeviceId("Processed");
            entity.setUploadDate(LocalDateTime.now());
            imageRepository.save(entity);

            String url = ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path("/images/")
                    .path(newFilename)
                    .toUriString();

            return ResponseEntity.ok(Map.of("url", url, "filename", newFilename));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Eroare la procesare: " + e.getMessage()));
        }
    }

    private String getExtensionFromFilename(String filename) {
        int dotIndex = filename.lastIndexOf(".");
        return (dotIndex != -1) ? filename.substring(dotIndex) : ".jpg";
    }

    @GetMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeImage(@RequestParam String filename) throws IOException {
        Path filePath = uploadDir.resolve(filename).normalize();
        BufferedImage img = ImageIO.read(filePath.toFile());

        Map<String, int[]> histogram = Analysis.computeHistogram(img);
        BufferedImage edgeImage = Analysis.detectEdges(img);

        Optional<ImageEntity> original = imageRepository.findByFilename(filename);
        String originalDeviceId = original.map(ImageEntity::getDeviceId).orElse("unknown");

        // Salvează imaginea cu muchii
        String edgeFilename = "edges_" + filename;
        ImageIO.write(edgeImage, "jpg", uploadDir.resolve(edgeFilename).toFile());

        // Salvează metadatele pentru imaginea de muchii
        ImageEntity edgeEntity = new ImageEntity();
        edgeEntity.setFilename(edgeFilename);
        edgeEntity.setDeviceId("Processed");
        edgeEntity.setFormat("image/jpeg");
        edgeEntity.setUploadDate(LocalDateTime.now());
        imageRepository.save(edgeEntity);

        String edgeUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/images/")
                .path(edgeFilename)
                .toUriString();

        return ResponseEntity.ok(Map.of(
                "histogram", histogram,
                "edgesUrl", edgeUrl
        ));
    }

    @GetMapping("/analyze/preview")
    public ResponseEntity<byte[]> analyzePreview(@RequestParam String filename) throws IOException {
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        BufferedImage original = ImageIO.read(filePath.toFile());
        if (original == null) {
            return ResponseEntity.badRequest().body(null);
        }

        BufferedImage edgeImage = Analysis.detectEdges(original);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(edgeImage, "jpg", baos);
        byte[] imageBytes = baos.toByteArray();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        headers.setContentLength(imageBytes.length);
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());

        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/analyze/histogram")
    public ResponseEntity<Map<String, int[]>> getHistogram(@RequestParam String filename) throws IOException {
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        BufferedImage image = ImageIO.read(filePath.toFile());
        if (image == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Map<String, int[]> histogram = Analysis.computeHistogram(image);

        return ResponseEntity.ok(histogram);
    }

}
