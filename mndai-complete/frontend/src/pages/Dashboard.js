import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import client from '../api/client';
import '../styles/dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await client.get('/analytics/dashboard');
      setAnalytics(response);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">MndAI</div>
        <div className="navbar-menu">
          <a href="/" className="active">Dashboard</a>
          <a href="/chat">Chat</a>
          <a href="/bookings">Bookings</a>
          <a href="/customers">Customers</a>
          <a href="/settings">Settings</a>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Welcome, {user?.business_name}</h1>

        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : analytics ? (
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Bookings</h3>
              <p className="metric-value">{analytics.bookings.total}</p>
              <small>{analytics.bookings.completed} completed</small>
            </div>

            <div className="metric-card">
              <h3>Customers</h3>
              <p className="metric-value">{analytics.customers.total}</p>
            </div>

            <div className="metric-card">
              <h3>Revenue</h3>
              <p className="metric-value">${analytics.revenue.total.toFixed(2)}</p>
            </div>

            <div className="metric-card">
              <h3>No-shows</h3>
              <p className="metric-value">{analytics.bookings.no_shows}</p>
            </div>
          </div>
        ) : null}

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button onClick={() => navigate('/bookings')} className="btn-primary">
              Create Booking
            </button>
            <button onClick={() => navigate('/chat')} className="btn-primary">
              Chat with Customers
            </button>
            <button onClick={() => navigate('/customers')} className="btn-primary">
              Add Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
