package Delima.com.example.OAuth2demo.DTO;

public class ReviewDTO {
    private Long id;
    private String comment;
    private String placeId;
    private String username;
    private String reviewText;
    public ReviewDTO() {}

    public ReviewDTO(Long id, String reviewText, String placeId, String username) {
        this.id = id;
        this.reviewText = reviewText;
        this.placeId = placeId;
        this.username = username;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}