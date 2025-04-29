package Delima.com.example.OAuth2demo.UserController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @PostMapping
    public ResponseEntity<JsonNode> getRoute(@RequestBody Map<String, Object> requestBody) {
        try {
            String apiKey = "5b3ce3597851110001cf62488b80ea3d9e4f40bfb907d0a6da5abdc6";
            URL url = new URL("https://api.openrouteservice.org/v2/directions/driving-car/geojson");

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            ObjectMapper mapper = new ObjectMapper();
            String jsonRequest = mapper.writeValueAsString(requestBody);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonRequest.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }

            JsonNode jsonResponse = mapper.readTree(response.toString());

            return ResponseEntity.ok(jsonResponse); // <--- return parsed JSON
        } catch (Exception e) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode errorNode = mapper.createObjectNode().put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorNode);
        }
    }
}
