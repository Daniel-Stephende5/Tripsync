package Delima.com.example.OAuth2demo.Service;

import Delima.com.example.OAuth2demo.Entity.Review;
import Delima.com.example.OAuth2demo.Repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


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
}