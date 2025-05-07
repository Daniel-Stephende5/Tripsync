package Delima.com.example.OAuth2demo.Service;

import Delima.com.example.OAuth2demo.Entity.Review;
import Delima.com.example.OAuth2demo.Repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public Review saveReview(Review review) {
        return reviewRepository.save(review);
    }
    public List<Review> getReviewsForPlace(String placeId) {
        return reviewRepository.findByPlaceId(placeId);
    }

    public List<Review> getReviewsByPlaceIds(List<String> placeIds) {
        return reviewRepository.findByPlaceIdIn(placeIds);
    }

    public Review updateReview(Long id, Review updatedReview) {
        return reviewRepository.findById(id)
                .map(existingReview -> {
                    // Update the rating and reviewText, even if placeId is not provided
                    existingReview.setRating(updatedReview.getRating());
                    existingReview.setReviewText(updatedReview.getReviewText());

                    // Only update placeId if it's not null
                    if (updatedReview.getPlaceId() != null) {
                        existingReview.setPlaceId(updatedReview.getPlaceId());
                    }

                    // Save the updated review
                    return reviewRepository.save(existingReview);
                })
                .orElseThrow(() -> new NoSuchElementException("Review not found with id: " + id));
    }


    // Delete a review by ID
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new NoSuchElementException("Review not found with id: " + id);
        }
        reviewRepository.deleteById(id);
    }
    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Review not found with id: " + id));
    }
}

