package com.uncle.authpractice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stylists")
@PrimaryKeyJoinColumn(name = "user_id")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
//@Builder
public class Stylist extends User{

    private String specialty;

    private Double rating = 0.0;

    private Integer reviewCount = 0;

    private String bio;

    private Integer experienceYears;

    @ElementCollection
    @CollectionTable(name = "stylist_services",
            joinColumns = @JoinColumn(name = "stylist_id"))
    @Column(name = "service_id")
    private List<Long> serviceIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "stylist_availability",
            joinColumns = @JoinColumn(name = "stylist_id"))
    @Column(name = "available")
    private List<Boolean> availability = new ArrayList<>();

    @OneToMany(mappedBy = "stylist")
    private List<Appointment> appointments = new ArrayList<>();

}
