package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.Entity.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import Delima.com.example.OAuth2demo.Service.UserService;
import Delima.com.example.OAuth2demo.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000") // or your frontend domain
@RestController
@RequestMapping("/api/auth")
public class UserController {

    private static final String CLIENT_ID = "757597466268-j5v89k86bp80lstb12veslslqojpva6c.apps.googleusercontent.com"; // replace with your actual client ID
    private final JwtUtil jwtUtil;

    private final UserService userService;

    @Autowired
    public UserController(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

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

                String email = idPayload.getEmail();
                String name = (String) idPayload.get("name");
                String picture = (String) idPayload.get("picture");

                // Check if user exists; if not, register them
                Optional<User> optionalUser = userService.getUserByUsername(email);
                if (optionalUser.isEmpty()) {
                    userService.registerUser(email, "GOOGLE_OAUTH_USER"); // dummy password, not used
                }

                // Generate the JWT token
                String jwtToken = jwtUtil.generateJwtToken(email);

                return ResponseEntity.ok(Map.of(
                        "token", jwtToken,
                        "email", email,
                        "name", name,
                        "picture", picture,
                        "message", "Google login successful"
                ));
            } else {
                return ResponseEntity.status(401).body("Invalid ID token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Token verification failed: " + e.getMessage());
        }
    }
}