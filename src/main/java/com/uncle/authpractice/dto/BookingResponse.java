package com.uncle.authpractice.dto;

public class BookingResponse {
    private Object data;
    private String message;

    public BookingResponse(Object data, String message) {
        this.data = data;
        this.message = message;
    }

    public BookingResponse() {
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
