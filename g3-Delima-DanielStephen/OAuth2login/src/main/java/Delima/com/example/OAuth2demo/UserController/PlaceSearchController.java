package Delima.com.example.OAuth2demo.UserController;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "http://localhost:3000")
public class PlaceSearchController {

    private final String API_KEY = "a291c92206msh89be76c578fa3d6p15eb77jsnc57a0c27e9ef";
    private final String BASE_URL = "https://opentripmap-places-v1.p.rapidapi.com";

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/geoname")
    public ResponseEntity<String> getGeoname(@RequestParam String name) {
        String url = BASE_URL + "/en/places/geoname?name=" + name;
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", API_KEY);
        headers.set("X-RapidAPI-Host", "opentripmap-places-v1.p.rapidapi.com");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/places")
    public ResponseEntity<String> getPlaces(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "3000") int radius,
            @RequestParam(defaultValue = "interesting_places|cultural|natural|foods") String kinds,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "json") String format
    ) {
        String url = BASE_URL + "/en/places/radius"
                + "?lat=" + lat
                + "&lon=" + lon
                + "&radius=" + radius
                + "&kinds=" + kinds
                + "&limit=" + limit
                + "&format=" + format;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", API_KEY);
        headers.set("X-RapidAPI-Host", "opentripmap-places-v1.p.rapidapi.com");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(@RequestParam String address) {
        try {
            String url = "https://nominatim.openstreetmap.org/search?q=" + address
                    + "&format=json&addressdetails=1&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "YourAppName (your-email@example.com)");
            headers.set("Accept-Language", "en");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching geolocation");
        }
    }
}
