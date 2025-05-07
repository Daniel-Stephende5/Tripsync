package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.DTO.ReviewDTO;
import Delima.com.example.OAuth2demo.Entity.Review;
import Delima.com.example.OAuth2demo.Entity.User;
import Delima.com.example.OAuth2demo.Repository.UserRepository;
import Delima.com.example.OAuth2demo.Service.ReviewService;
import Delima.com.example.OAuth2demo.Security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/places/reviews")

@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Helper method to extract username from token
    private String getUsernameFromToken(String token) {
        System.out.println("Validating token: " + token); // Debugging
        if (jwtUtil.validateJwtToken(token)) {
            String username = jwtUtil.getUsernameFromJwtToken(token);
            System.out.println("Token validated, username: " + username); // Debugging
            return username;
        } else {
            System.out.println("Invalid token"); // Debugging
            throw new SecurityException("Invalid or expired token");
        }
    }

    // POST: Submit review with Authorization header
    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<?> submitReview(
            @RequestHeader("Authorization") String token,
            @RequestBody Review review) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Authorization header is missing or malformed"));
            }

            String jwtToken = token.substring(7); // remove "Bearer "
            String username = getUsernameFromToken(jwtToken);
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found"));
            }

            review.setUser(userOptional.get()); // Link review to the user
            Review savedReview = reviewService.saveReview(review);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to submit review"));
        }
    }


    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getReviews(@RequestParam List<String> placeIds) {
        List<Review> reviews = reviewService.getReviewsByPlaceIds(placeIds);
        System.out.println("Reviews fetched: " + reviews);  // Log the fetched reviews
        if (reviews.isEmpty()) {
            System.out.println("No reviews found for the provided placeIds");  // Debugging
        }
        List<ReviewDTO> dtos = reviews.stream().map(review ->
                new ReviewDTO(
                        review.getId(),
                        review.getReviewText(),
                        review.getPlaceId(),
                        review.getUser().getUsername()
                )
        ).toList();
        return ResponseEntity.ok(dtos);
    }
    // GET: Reviews for multiple placeIds
    @GetMapping("/{placeId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsForPlace(@PathVariable String placeId) {
        List<Review> reviews = reviewService.getReviewsForPlace(placeId);
        System.out.println("Fetched " + reviews.size() + " reviews for placeId: " + placeId);

        for (Review r : reviews) {
            System.out.println("Review: " + r.getId() + ", Text: " + r.getReviewText() + ", User: " +
                    (r.getUser() != null ? r.getUser().getUsername() : "NULL"));
        }

        List<ReviewDTO> dtos = reviews.stream().map(review -> {
            String username = review.getUser() != null ? review.getUser().getUsername() : "unknown";
            return new ReviewDTO(
                    review.getId(),
                    review.getReviewText(),
                    review.getPlaceId(),
                    username
            );
        }).toList();

        return ResponseEntity.ok(dtos);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateReview(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Review updatedReview) {

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Authorization header is missing or malformed"));
            }

            String jwtToken = token.substring(7);
            String username = getUsernameFromToken(jwtToken);

            Review existingReview = reviewService.getReviewById(id);

            if (!existingReview.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "You are not authorized to edit this review"));
            }

            Review updated = reviewService.updateReview(id, updatedReview);
            return ResponseEntity.ok(updated);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update review"));
        }
    }

    @DeleteMapping("/user/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteOwnReview(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Authorization header is missing or malformed"));
            }

            String jwtToken = token.substring(7);
            String username = getUsernameFromToken(jwtToken);

            Review existingReview = reviewService.getReviewById(id);

            if (!existingReview.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "You are not allowed to delete someone else's review"));
            }

            reviewService.deleteReview(id);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Review not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete review"));
        }
    }
}
