package Delima.com.example.OAuth2demo.Repository;

import Delima.com.example.OAuth2demo.Entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPlaceId(String placeId);
    List<Review> findByPlaceIdIn(List<String> placeIds);
}

