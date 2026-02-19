package com.uncle.authpractice.service;

import com.uncle.authpractice.dto.BookingRequest;
import com.uncle.authpractice.dto.BookingResponse;
import com.uncle.authpractice.model.Booking;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BookingService {
     BookingResponse createBooking(BookingRequest request);
     List<Booking> getAllBookings();
}
