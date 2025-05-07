package Delima.com.example.OAuth2demo.Repository;

import Delima.com.example.OAuth2demo.Entity.ExpenseEntity;
import Delima.com.example.OAuth2demo.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {
    List<ExpenseEntity> findByUser(User user); // Fetch all expenses
}
