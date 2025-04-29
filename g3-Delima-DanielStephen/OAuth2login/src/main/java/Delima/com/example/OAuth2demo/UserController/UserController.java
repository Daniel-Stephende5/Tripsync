package Delima.com.example.OAuth2demo.UserController;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;

import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000") // or your frontend domain
@RestController
@RequestMapping("/api/auth")
public class UserController {

    private static final String CLIENT_ID = "757597466268-j5v89k86bp80lstb12veslslqojpva6c.apps.googleusercontent.com"; // replace with your actual client ID

    @PostMapping("/google")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload idPayload = idToken.getPayload();

                // Get profile info from payload
                String email = idPayload.getEmail();
                String name = (String) idPayload.get("name");
                String picture = (String) idPayload.get("picture");

                // You can now lookup or create a user in your DB here
                return ResponseEntity.ok(Map.of(
                        "email", email,
                        "name", name,
                        "picture", picture
                ));
            } else {
                return ResponseEntity.status(401).body("Invalid ID token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Token verification failed: " + e.getMessage());
        }
    }
}
