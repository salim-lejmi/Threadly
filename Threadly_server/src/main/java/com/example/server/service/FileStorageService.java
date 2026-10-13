package com.example.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif",
            "image/webp", ".webp"
    );

    private final Path root;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String dir) throws IOException {
        this.root = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    public Path getRoot() {
        return root;
    }

    // returns the public path (e.g. "/uploads/abc.png"), or null if no file was sent
    public String saveImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String ext = TYPES.get(file.getContentType());
        if (ext == null) {
            throw new RuntimeException("Only JPG, PNG, GIF or WebP images are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new RuntimeException("Image must be under 5 MB");
        }
        String name = UUID.randomUUID() + ext;
        try {
            file.transferTo(root.resolve(name));
        } catch (IOException e) {
            throw new RuntimeException("Could not save the image");
        }
        return "/uploads/" + name;
    }

    public void delete(String url) {
        if (url == null || !url.startsWith("/uploads/")) {
            return;
        }
        try {
            Path file = root.resolve(url.substring("/uploads/".length())).normalize();
            if (file.startsWith(root)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ignored) {
            // a leftover file isn't worth failing the request
        }
    }
}