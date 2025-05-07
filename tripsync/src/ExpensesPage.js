import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpensePages.css';

const Navbar = ({ onTripsClick, onExpensesClick, handleLogoClick }) => (
  <nav className="navbar">
    <div className="navbar-logo" onClick={handleLogoClick}>TripSync</div>
    <ul className="navbar-links">
      <li><button className="navbar-link" onClick={onExpensesClick}>Expenses</button></li>
      <li><button className="navbar-link" onClick={onTripsClick}>Trips</button></li>
      
    </ul>
  </nav>
);

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  // Navigation handlers
  const handleTripsClick = () => navigate('/searchplaces');
  const handleExpensesClick = () => navigate('/expenses');
  const handleLogoClick = () => navigate('/landingpage');

  // Helper functions for authentication
  const getToken = () => localStorage.getItem('authToken');
  const isAuthenticated = () => {
    const token = getToken();
    if (!token) {
      navigate('/');
      return false;
    }
    return true;
  };

  // Fetch expenses from the backend
  const fetchExpenses = async () => {
    if (!isAuthenticated()) return;

    try {
      const token = getToken();
      const response = await fetch('https://tripsync-1.onrender.com/api/expenses/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Make sure the token is included here
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/');
        }
        throw new Error(`Failed to fetch expenses: ${response.statusText}`);
      }

      const data = await response.json();
      setExpenses(data);
      setTotal(data.reduce((sum, exp) => sum + parseFloat(exp.amount), 0));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle form submit for adding/editing expenses
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    const newExpense = {
      category,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString(),
    };

    const endpoint = editMode && currentExpense?.id
      ? `https://tripsync-1.onrender.com/api/expenses/${currentExpense.id}`
      : 'https://tripsync-1.onrender.com/api/expenses/user';
    const method = editMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, //and here
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error(`${method} expense failed: ${response.statusText}`);
      }

      fetchExpenses();
      resetForm();
    } catch (error) {
      console.error('Error submitting expense:', error);
    }
  };

  // Handle edit action
  const handleEdit = (expense) => {
    setCategory(expense.category);
    setAmount(expense.amount);
    setCurrentExpense(expense);
    setEditMode(true);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    const token = getToken();

    try {
      const response = await fetch(`https://tripsync-1.onrender.com/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, //and here
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete expense: ${response.statusText}`);
      }

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Reset form fields and state
  const resetForm = () => {
    setCategory('');
    setAmount('');
    setEditMode(false);
    setCurrentExpense(null);
  };

  return (
    <div className="expenses-container">
      <Navbar
        onTripsClick={handleTripsClick}
        onExpensesClick={handleExpensesClick}
        handleLogoClick={handleLogoClick}
      />

      <h1 className="expenses-title">💰 Total Expenditures</h1>
      <div className="total-amount">₱ {total.toFixed(2)}</div>

      <form onSubmit={handleSubmit} className="expense-form">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">{editMode ? 'Update Expense' : 'Add Expense'}</button>
        {editMode && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <div className="table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount (₱)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td>{index + 1}</td>
                <td>{expense.category}</td>
                <td>{new Date(expense.timestamp).toLocaleString()}</td>
                <td>{parseFloat(expense.amount).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEdit(expense)}>Edit</button>
                  <button onClick={() => handleDelete(expense.id)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-expenses">No expenses recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesPage;

