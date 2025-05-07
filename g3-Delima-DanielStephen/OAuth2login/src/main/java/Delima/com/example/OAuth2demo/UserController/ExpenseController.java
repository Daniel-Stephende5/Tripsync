package Delima.com.example.OAuth2demo.UserController;

import Delima.com.example.OAuth2demo.Service.ExpenseService;
import Delima.com.example.OAuth2demo.Entity.ExpenseEntity;
import Delima.com.example.OAuth2demo.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final JwtUtil jwtUtil;

    @Autowired
    public ExpenseController(ExpenseService expenseService, JwtUtil jwtUtil) {
        this.expenseService = expenseService;
        this.jwtUtil = jwtUtil;
    }

    private String getUsernameFromToken(String token) {
        System.out.println("Validating token: " + token); // Debugging
        if (jwtUtil.validateJwtToken(token)) {
            String username = jwtUtil.getUsernameFromJwtToken(token);
            System.out.println("Token validated, username: " + username); // Debugging
            return username;
        } else {
            System.out.println("Invalid token"); // Debugging
            throw new SecurityException("Invalid or expired token");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserExpenses(@RequestHeader("Authorization") String token) {
        try {
            // Debugging token received from Postman
            System.out.println("Token from Authorization header: " + token);

            // Check if token is null or doesn't start with 'Bearer '
            if (token == null || !token.startsWith("Bearer ")) {
                System.out.println("Token missing or malformed");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Authorization header is missing or malformed"));
            }

            // Extract the token without 'Bearer ' prefix
            String jwtToken = token.substring(7);
            String username = getUsernameFromToken(jwtToken); // Extract username from token

            // Continue normal flow
            List<ExpenseEntity> expenses = expenseService.getExpensesForUser(username);
            return ResponseEntity.ok(expenses);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to retrieve expenses"));
        }
    }


    @PostMapping("/user")
    public ResponseEntity<?> addExpense(@RequestHeader("Authorization") String token, @RequestBody ExpenseEntity expense) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Authorization header is missing or malformed"));
            }

            String username = getUsernameFromToken(token.substring(7)); // Strip "Bearer " prefix
            ExpenseEntity savedExpense = expenseService.createExpense(expense, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to add expense"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody ExpenseEntity updatedExpense) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Authorization header is missing or malformed"));
            }

            String username = getUsernameFromToken(token.substring(7)); // Strip "Bearer " prefix
            ExpenseEntity expense = expenseService.updateExpense(id, updatedExpense, username);
            return ResponseEntity.ok(expense);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update expense"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Authorization header is missing or malformed"));
            }

            String username = getUsernameFromToken(token.substring(7)); // Strip "Bearer " prefix
            expenseService.deleteExpense(id, username);
            return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete expense"));
        }
    }
}
