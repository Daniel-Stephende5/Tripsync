package Delima.com.example.OAuth2demo.Repository;

import Delima.com.example.OAuth2demo.Entity.Trip;
import Delima.com.example.OAuth2demo.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUser(User user);
}
