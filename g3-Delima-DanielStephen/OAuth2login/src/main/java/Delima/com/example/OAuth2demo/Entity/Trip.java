package Delima.com.example.OAuth2demo.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "trip")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String destinationName;
    private double destinationLat;
    private double destinationLon;

    private double originLat;
    private double originLon;
  
    private LocalDate travelDate;
    @Lob
    private String mapImage;
    // Getters and Setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getDestinationName() { return destinationName; }

    public void setDestinationName(String destinationName) { this.destinationName = destinationName; }

    public double getDestinationLat() { return destinationLat; }

    public void setDestinationLat(double destinationLat) { this.destinationLat = destinationLat; }

    public double getDestinationLon() { return destinationLon; }

    public void setDestinationLon(double destinationLon) { this.destinationLon = destinationLon; }

    public double getOriginLat() { return originLat; }

    public void setOriginLat(double originLat) { this.originLat = originLat; }

    public double getOriginLon() { return originLon; }

    public void setOriginLon(double originLon) { this.originLon = originLon; }

    public LocalDate getTravelDate() { return travelDate; }
    public String getMapImage() { return mapImage; }
    public void setMapImage(String mapImage) { this.mapImage=mapImage; }

    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }
}
