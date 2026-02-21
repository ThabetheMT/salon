package com.uncle.authpractice.repository;

import com.uncle.authpractice.model.Role;
import com.uncle.authpractice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    List<User> findAllByRoleOrderByIdDesc(Role role);
}
