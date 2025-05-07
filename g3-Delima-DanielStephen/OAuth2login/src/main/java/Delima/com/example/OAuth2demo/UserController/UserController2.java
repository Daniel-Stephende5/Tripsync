package  Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.DTO.LoginRequest;
import Delima.com.example.OAuth2demo.DTO.RegisterRequest;
import Delima.com.example.OAuth2demo.Service.UserService;
 import Delima.com.example.OAuth2demo.Entity.User;
import Delima.com.example.OAuth2demo.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://tripsync-1.onrender.com")  // React app URL
public class UserController2 {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController2(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getUsername(), request.getPassword());
            return ResponseEntity.ok("User registered successfully: " + user.getUsername());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            User user = userService.authenticateUser(request.getUsername(), request.getPassword());
            String token = jwtUtil.generateJwtToken(user.getUsername());
            return ResponseEntity.ok(Map.of("token", token, "message", "User logged in successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
