package com.realdeal.backend.storage.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UploadServiceTest {

    @Mock  private S3Client s3;
    @Mock  private MultipartFile file;

    @InjectMocks
    private UploadService uploadService;

    @BeforeEach
    void setUp() throws IOException {
        ReflectionTestUtils.setField(uploadService, "bucketName", "test-bucket");

        when(file.getOriginalFilename()).thenReturn("pic.png");
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenReturn("PNG".getBytes());
    }

    @Test
    void uploadToS3_putsObjectAndReturnsPublicUrl() {
        when(s3.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
            .thenReturn(null); // return value not used

        String url = uploadService.uploadToS3(file);

        assertTrue(url.startsWith("https://test-bucket.s3.amazonaws.com/uploads/"));
        assertTrue(url.endsWith("pic.png"));

        verify(s3, times(1))
            .putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadToS3_wrapsIOException() throws IOException {
        when(file.getBytes()).thenThrow(new IOException("boom"));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> uploadService.uploadToS3(file));
        assertEquals("Failed to upload file", ex.getMessage());
    }
}
