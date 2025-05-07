package Delima.com.example.OAuth2demo.Service;

import Delima.com.example.OAuth2demo.Entity.Trip;
import Delima.com.example.OAuth2demo.Entity.User;
import Delima.com.example.OAuth2demo.Repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserService userService;

    @Autowired
    public TripService(TripRepository tripRepository, UserService userService) {
        this.tripRepository = tripRepository;
        this.userService = userService;
    }

    public Trip createTrip(Trip trip, String username) {
        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        trip.setUser(user);
        return tripRepository.save(trip);
    }

    public List<Trip> getTripsByUsername(String username) {
        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return tripRepository.findByUser(user);
    }
    public void deleteTrip(Long id, String username) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Trip not found with id: " + id));

        if (!trip.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized to delete this trip");
        }

        tripRepository.delete(trip);
    }
}