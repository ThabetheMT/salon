package com.uncle.authpractice.service;

import com.uncle.authpractice.dto.BookingRequest;
import com.uncle.authpractice.dto.BookingResponse;
import com.uncle.authpractice.model.Booking;
import com.uncle.authpractice.model.User;
import com.uncle.authpractice.repository.BookingRepository;
import com.uncle.authpractice.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingServiceImpl (BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Booking booking = new Booking();
        booking.setBookingType(request.getBookingType());
        booking.setBookingStatus(request.getBookingStatus());
        booking.setUser(user);
        booking.setBookingDate(LocalDateTime.now());
        bookingRepository.save(booking);

        return new BookingResponse(booking, "Booking was created successfully");
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
