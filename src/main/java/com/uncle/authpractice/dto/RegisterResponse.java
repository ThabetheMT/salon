package com.uncle.authpractice.dto;

public class RegisterResponse {
    private Object data;
    private String message;

    public RegisterResponse(Object data, String message) {
        this.data = data;
        this.message = message;
    }

    public RegisterResponse() {
    }

    public Object getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }
}
