package com.uncle.authpractice.repository;

import com.uncle.authpractice.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalonServiceRepository extends JpaRepository<Service, Long> {
}
