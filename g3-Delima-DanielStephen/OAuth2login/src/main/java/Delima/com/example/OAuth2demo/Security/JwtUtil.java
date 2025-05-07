package Delima.com.example.OAuth2demo.Security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    // Use a static secret key (e.g., loaded from application.properties or hardcoded)
    @Value("${jwt.secret}")  // The secret key from application.properties (or use a static key directly)
    private String secretKey;

    // Generate JWT Token using the static secret key
    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username) // Set the subject (typically the username or user ID)
                .setIssuedAt(new Date()) // Set the issued time
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Set expiration (24 hours)
                .signWith(SignatureAlgorithm.HS512, secretKey) // Sign with the static secret key
                .compact(); // Create the JWT token
    }

    // Validate the JWT Token
    public boolean validateJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey) // Ensure this is the correct secret key
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Debugging: Print the claims and expiration
            System.out.println("JWT Claims: " + claims);
            System.out.println("Token Expiration: " + claims.getExpiration());

            // Check if token has expired
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            // Debugging: Print any exception details
            System.out.println("Token validation failed: " + e.getMessage());
            return false;
        }
    }

    // Get the username from the JWT token
    public String getUsernameFromJwtToken(String token) {
        // Parse the token and extract the subject (username)
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey) // Use the static secret key
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject(); // Return the username (subject)
    }
}
