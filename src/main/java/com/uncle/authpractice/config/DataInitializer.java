package com.uncle.authpractice.config;

import com.uncle.authpractice.model.Service;
import com.uncle.authpractice.repository.SalonServiceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer {

    private final SalonServiceRepository salonServiceRepository;

    public DataInitializer(SalonServiceRepository salonServiceRepository) {
        this.salonServiceRepository = salonServiceRepository;
    }

    @PostConstruct
    public void init(){

        List<Service> services = new ArrayList<>();
        services.add(new Service("Hair Cut", 150, "All hair cuts"));
        services.add(new Service("Nails", 200, "Best nails in the country"));
        services.add(new Service("Make up", 100, "We deliver the best make up"));

        if (salonServiceRepository.findAll().isEmpty()) {
            salonServiceRepository.saveAll(services);
        }
    }
}
