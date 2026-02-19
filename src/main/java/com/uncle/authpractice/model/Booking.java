package com.uncle.authpractice.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_tbl")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long booking_id;
    private LocalDateTime bookingDate;
    private String bookingType;
    private String bookingStatus;
    private String bookingLocation;

    @ManyToOne()
    @JoinColumn(name = "customer", referencedColumnName = "id")
    private User user;

    public Booking() {
    }

    public Long getBooking_id() {
        return booking_id;
    }

    public void setBooking_id(Long booking_id) {
        this.booking_id = booking_id;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public String getBookingLocation() {
        return bookingLocation;
    }

    public void setBookingLocation(String bookingLocation) {
        this.bookingLocation = bookingLocation;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
