package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.Security.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@PreAuthorize("hasRole('USER')")
public class RouteController {

    private final JwtUtil jwtUtil;

    @Autowired
    public RouteController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<JsonNode> getRoute(@RequestHeader("Authorization") String authHeader,
                                             @RequestBody Map<String, Object> requestBody) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = getUsernameFromToken(token);
            String apiKey = "5b3ce3597851110001cf62488b80ea3d9e4f40bfb907d0a6da5abdc6";
            URL url = new URL("https://api.openrouteservice.org/v2/directions/driving-car/geojson");

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", apiKey); // Correct header: ORS expects API key, not Bearer
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            ObjectMapper mapper = new ObjectMapper();
            String jsonRequest = mapper.writeValueAsString(requestBody);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonRequest.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int statusCode = conn.getResponseCode();
            InputStream responseStream = (statusCode >= 200 && statusCode < 300)
                    ? conn.getInputStream()
                    : conn.getErrorStream();

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(responseStream, "utf-8"))) {
                String line;
                while ((line = br.readLine()) != null) {
                    response.append(line.trim());
                }
            }

            JsonNode jsonResponse = mapper.readTree(response.toString());

            if (statusCode >= 200 && statusCode < 300) {
                return ResponseEntity.ok(jsonResponse);
            } else {
                return ResponseEntity.status(statusCode).body(jsonResponse);
            }

        } catch (Exception e) {
            e.printStackTrace();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode errorNode = mapper.createObjectNode().put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorNode);
        }
    }

    private String getUsernameFromToken(String token) {
        System.out.println("Validating token: " + token);
        if (jwtUtil.validateJwtToken(token)) {
            String username = jwtUtil.getUsernameFromJwtToken(token);
            System.out.println("Token validated, username: " + username);
            return username;
        } else {
            System.out.println("Invalid token");
            throw new SecurityException("Invalid or expired token");
        }
    }
}
