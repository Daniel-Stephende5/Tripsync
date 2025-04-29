package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.Entity.Review;
import Delima.com.example.OAuth2demo.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/api/places/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Endpoint to submit a review
    @PostMapping
    public Review submitReview(@RequestBody Review review) {
        return reviewService.saveReview(review);
    }

    // Endpoint to get all reviews for a specific place
    @GetMapping("/{placeId}")
    public List<Review> getReviewsForPlace(@PathVariable String placeId) {
        return reviewService.getReviewsForPlace(placeId);
    }

    @GetMapping
    public ResponseEntity<List<Review>> getReviews(@RequestParam List<String> placeIds) {
        List<Review> reviews = reviewService.getReviewsByPlaceIds(placeIds);
        return ResponseEntity.ok(reviews);
    }
}