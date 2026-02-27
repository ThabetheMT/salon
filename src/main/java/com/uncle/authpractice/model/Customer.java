package com.uncle.authpractice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "customers")
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "user_id")
public class Customer extends User{

    private LocalDateTime dateOfBirth;

    private String address;

    private Integer loyaltyPoints = 0;

    private String membershipLevel = "Bronze";

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "customer_favorites",
            joinColumns = @JoinColumn(name = "customer_id"))
    @Column(name = "favorite_stylist_id")
    private List<Long> favoriteStylistIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "customer_favorite_services",
            joinColumns = @JoinColumn(name = "customer_id"))
    @Column(name = "favorite_service_id")
    private List<Long> favoriteServiceIds = new ArrayList<>();


}
