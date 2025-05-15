package com.realdeal.backend.storage.controller;

import com.realdeal.backend.storage.service.UploadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UploadController.class)
class UploadControllerTest {

    @Autowired private MockMvc mvc;

    @MockitoBean
    private UploadService uploadService;

    @Test
    void upload_returnsUrl() throws Exception {
        when(uploadService.uploadToS3(any())).thenReturn("https://bucket/key");

        MockMultipartFile mockFile =
            new MockMultipartFile("file", "hello.txt",
                "text/plain", "hi".getBytes());

        mvc.perform(multipart("/api/upload").file(mockFile))
            .andExpect(status().isOk())
            .andExpect(content().string("https://bucket/key"));
    }
}
