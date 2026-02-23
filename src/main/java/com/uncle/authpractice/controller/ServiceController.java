package com.uncle.authpractice.controller;

import com.uncle.authpractice.model.Service;
import com.uncle.authpractice.repository.SalonServiceRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/public/services")
public class ServiceController {

    private final SalonServiceRepository serviceRepository;

    public ServiceController(SalonServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Service>> getService(String serviceId) {
        try{
            return ResponseEntity.ok()
                    .body(serviceRepository.findAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

}
