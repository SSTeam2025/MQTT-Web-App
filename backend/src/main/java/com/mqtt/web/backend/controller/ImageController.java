package com.mqtt.web.backend.controller;

import com.mqtt.web.backend.dtos.ImageDTO;
import com.mqtt.web.backend.dtos.ImageUploadRequest;
import com.mqtt.web.backend.model.ImageEntity;
import com.mqtt.web.backend.repository.ImageRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

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

            // Generează nume unic (sau folosește ce primești)
            String filename = UUID.randomUUID() + "_" + request.getFilename();
            String extension = getExtensionFromFormat(request.getFormat());

            if (!filename.endsWith(extension)) {
                filename += extension;
            }

            // Salvează local în uploads/
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(filename);
            Files.write(filePath, imageBytes);

            // Salvează metadatele în DB
            ImageEntity entity = new ImageEntity();
            entity.setFilename(filename);
            entity.setDeviceId(request.getDeviceId());
            entity.setUploadDate(LocalDateTime.now());
            entity.setFormat(request.getFormat());

            imageRepository.save(entity);

            return ResponseEntity.ok("Imagine salvată cu succes: " + filename);
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Eroare la salvare: " + e.getMessage());
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


}
