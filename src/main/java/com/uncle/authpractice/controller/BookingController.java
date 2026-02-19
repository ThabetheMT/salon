package com.uncle.authpractice.controller;

import com.uncle.authpractice.dto.BookingRequest;
import com.uncle.authpractice.model.Booking;
import com.uncle.authpractice.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try{
            return ResponseEntity.ok(bookingService.createBooking(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> allBookings() {
        try{
            return ResponseEntity.ok(bookingService.getAllBookings());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
