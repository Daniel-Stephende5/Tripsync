package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.Entity.Trip;
import Delima.com.example.OAuth2demo.Repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:3000") // Update if different port
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @PostMapping
    public Trip bookTrip(@RequestBody Trip trip) {
        return tripRepository.save(trip);
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }
    @DeleteMapping("/{id}")
    public void deleteTrip(@PathVariable Long id) {
        tripRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public Trip updateTrip(@PathVariable Long id, @RequestBody Trip updatedTrip) {
        return tripRepository.findById(id)
                .map(trip -> {
                    trip.setDestinationName(updatedTrip.getDestinationName());
                    trip.setTravelDate(updatedTrip.getTravelDate());
                    trip.setMapImage(updatedTrip.getMapImage());
                    return tripRepository.save(trip);
                })
                .orElseThrow(() -> new RuntimeException("Trip not found with id " + id));
    }
}
