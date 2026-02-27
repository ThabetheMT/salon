package com.uncle.authpractice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AuthPracticeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthPracticeApplication.class, args);
    }

}
