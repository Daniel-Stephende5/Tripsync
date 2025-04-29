package Delima.com.example.OAuth2demo.Repository;

import Delima.com.example.OAuth2demo.Entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
}
