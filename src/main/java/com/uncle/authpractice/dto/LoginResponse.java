package com.uncle.authpractice.dto;

public class LoginResponse {
    private String acessToken;
    private Object user;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(String acessToken, Object user, String message) {
        this.acessToken = acessToken;
        this.user = user;
        this.message = message;
    }

    public String getAcessToken() {
        return acessToken;
    }

    public void setAcessToken(String acessToken) {
        this.acessToken = acessToken;
    }

    public Object getUser() {
        return user;
    }

    public void setUser(Object user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
