package com.uncle.authpractice.dto;

public class BookingRequest {
    private String bookingType;
    private String bookingStatus;
   // private String bookingLocation;


    public BookingRequest(String bookingType, String bookingStatus) {
        this.bookingType = bookingType;
        this.bookingStatus = bookingStatus;
    }

    public BookingRequest() {
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
}
