//  OAuth2demo/UserController/TripController.java
package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.Entity.Trip;
import Delima.com.example.OAuth2demo.Service.TripService;
import Delima.com.example.OAuth2demo.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:3000")
public class TripController {

    private final TripService tripService;
    private final JwtUtil jwtUtil;

    @Autowired
    public TripController(TripService tripService, JwtUtil jwtUtil) {
        this.tripService = tripService;
        this.jwtUtil = jwtUtil;
    }

    private String getUsernameFromToken(String token) {
        // Strip "Bearer " prefix if present
        if (token == null || !token.startsWith("Bearer ")) {
            throw new SecurityException("Authorization header is missing or malformed");
        }

        String jwtToken = token.substring(7); // Remove "Bearer "
        if (jwtUtil.validateJwtToken(jwtToken)) {
            return jwtUtil.getUsernameFromJwtToken(jwtToken);
        } else {
            throw new SecurityException("Invalid or expired token");
        }
    }
    @PostMapping
    public ResponseEntity<?> createTrip(@RequestHeader("Authorization") String token, @RequestBody Trip trip) {
        try {
            String username = getUsernameFromToken(token);
            Trip createdTrip = tripService.createTrip(trip, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTrip);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create trip"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserTrips(@RequestHeader("Authorization") String token) {
        try {
            String username = getUsernameFromToken(token);
            List<Trip> trips = tripService.getTripsByUsername(username);
            return ResponseEntity.ok(trips);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get user trips"));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            String username = getUsernameFromToken(token);
            tripService.deleteTrip(id, username);
            return ResponseEntity.ok(Map.of("message", "Trip deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete trip"));
        }
    }
}