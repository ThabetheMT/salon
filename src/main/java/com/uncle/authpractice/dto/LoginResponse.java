package com.uncle.authpractice.dto;

public class LoginResponse {
    private String token;
    private Object data;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(String token, Object data, String message) {
        this.token = token;
        this.data = data;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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
