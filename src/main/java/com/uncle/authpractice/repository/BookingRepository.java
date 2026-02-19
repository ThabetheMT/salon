package com.uncle.authpractice.repository;

import com.uncle.authpractice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByBookingStatus(String status);
}
