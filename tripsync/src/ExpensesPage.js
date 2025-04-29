import React, { useEffect, useState } from 'react';
import './ExpensePages.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onTripsClick, onExpensesClick,handleLogoClick }) => (
  <nav className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>TripSync</div>
    <ul className="navbar-links">
      <li><button className="navbar-link" onClick={onExpensesClick}>Expenses</button></li>
      <li><button className="navbar-link" onClick={onTripsClick}>Trips</button></li>
      <li><button className="navbar-link">Profile</button></li>
      <li><button className="navbar-link">Settings</button></li>
      <li><button className="navbar-link">Logout</button></li>
    </ul>
  </nav>
);

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const navigate = useNavigate();

  const handleTripsClick = () => navigate('/searchplaces');
  const handleExpensesClick = () => navigate('/expenses');
  const handleLogoClick = () => {
    navigate('/landingpage');  // Navigate to landing page when logo is clicked
  };
  

  const fetchExpenses = () => {
    fetch('https://tripsync-1.onrender.com/api/expenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(data);
        const sum = data.reduce((acc, item) => acc + item.amount, 0);
        setTotal(sum);
      })
      .catch(err => console.error("Error fetching expenses:", err));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      category,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString()
    };

    if (editMode) {
      // Update existing expense
      fetch(`https://tripsync-1.onrender.com/api/expenses/${currentExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      })
        .then(res => res.json())
        .then(() => {
          fetchExpenses();
          resetForm();
        })
        .catch(err => console.error("Error updating expense:", err));
    } else {
      // Add new expense
      fetch('https://tripsync-1.onrender.com/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      })
        .then(res => res.json())
        .then(() => {
          fetchExpenses();
          resetForm();
        })
        .catch(err => console.error("Error adding expense:", err));
    }
  };

  const handleEdit = (expense) => {
    setCategory(expense.category);
    setAmount(expense.amount);
    setCurrentExpense(expense);
    setEditMode(true);
  };

  const handleDelete = (id) => {
    fetch(`https://tripsync-1.onrender.com/api/expenses/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchExpenses())
      .catch(err => console.error("Error deleting expense:", err));
  };

  const resetForm = () => {
    setCategory('');
    setAmount('');
    setEditMode(false);
    setCurrentExpense(null);
  };

  return (
    <div className="expenses-container">
      <Navbar onTripsClick={handleTripsClick} onExpensesClick={handleExpensesClick}handleLogoClick={handleLogoClick} />

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
            {expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td>{index + 1}</td>
                <td>{expense.category}</td>
                <td>{new Date(expense.timestamp).toLocaleString()}</td>
                <td>{expense.amount.toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEdit(expense)}>Edit</button>
                  <button onClick={() => handleDelete(expense.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
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
