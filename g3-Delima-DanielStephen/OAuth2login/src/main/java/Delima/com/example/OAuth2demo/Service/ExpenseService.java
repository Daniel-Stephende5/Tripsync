package Delima.com.example.OAuth2demo.Service;

import Delima.com.example.OAuth2demo.Entity.ExpenseEntity;
import Delima.com.example.OAuth2demo.Entity.User;
import Delima.com.example.OAuth2demo.Repository.ExpenseRepository;
import Delima.com.example.OAuth2demo.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public List<ExpenseEntity> getExpensesForUser(String username) {
        try {
            logger.info("Fetching expenses for user: {}", username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new NoSuchElementException("User not found: " + username));
            List<ExpenseEntity> expenses = expenseRepository.findByUser(user);
            logger.info("Found {} expenses for user: {}", expenses.size(), username);
            return expenses;
        } catch (Exception e) {
            logger.error("Error fetching expenses for user {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch expenses for user: " + username);
        }
    }

    public ExpenseEntity createExpense(ExpenseEntity expense, String username) {
        try {
            logger.info("Creating expense for user: {}", username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new NoSuchElementException("User not found: " + username));
            expense.setUser(user);
            ExpenseEntity savedExpense = expenseRepository.save(expense);
            logger.info("Successfully created expense: {}", savedExpense);
            return savedExpense;
        } catch (Exception e) {
            logger.error("Error creating expense for user {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to create expense");
        }
    }

    public ExpenseEntity updateExpense(Long id, ExpenseEntity updatedExpense, String username) {
        try {
            logger.info("Updating expense with id: {}", id);
            ExpenseEntity existingExpense = expenseRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Expense not found with id: " + id));

            if (!existingExpense.getUser().getUsername().equals(username)) {
                throw new IllegalArgumentException("User is not authorized to update this expense");
            }

            existingExpense.setAmount(updatedExpense.getAmount());
            existingExpense.setCategory(updatedExpense.getCategory());
            ExpenseEntity updated = expenseRepository.save(existingExpense);
            logger.info("Successfully updated expense: {}", updated);
            return updated;
        } catch (Exception e) {
            logger.error("Error updating expense with id: {} for user {}: {}", id, username, e.getMessage(), e);
            throw new RuntimeException("Failed to update expense");
        }
    }

    public void deleteExpense(Long id, String username) {
        try {
            logger.info("Deleting expense with id: {} for user {}", id, username);
            ExpenseEntity expense = expenseRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Expense not found with id: " + id));

            if (!expense.getUser().getUsername().equals(username)) {
                throw new IllegalArgumentException("User is not authorized to delete this expense");
            }

            expenseRepository.delete(expense);
            logger.info("Successfully deleted expense with id: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting expense with id: {} for user {}: {}", id, username, e.getMessage(), e);
            throw new RuntimeException("Failed to delete expense");
        }
    }
}
