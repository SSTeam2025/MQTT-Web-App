package com.mqtt.web.backend.repository;

import com.mqtt.web.backend.model.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<ImageEntity, Long> {
    List<ImageEntity> findByDeviceId(String deviceId);

    List<ImageEntity> findByUploadDateBetween(LocalDateTime start, LocalDateTime end);

    List<ImageEntity> findByDeviceIdAndUploadDateBetween(String deviceId, LocalDateTime start, LocalDateTime end);
    Optional<ImageEntity> findByFilename(String filename);

}
