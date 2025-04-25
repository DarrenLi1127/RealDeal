package com.realdeal.backend.storage.controller;

import com.realdeal.backend.storage.service.UploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private UploadService uploadService;

    @PostMapping
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        String url = uploadService.uploadToS3(file);
        return ResponseEntity.ok(url);
    }
}
