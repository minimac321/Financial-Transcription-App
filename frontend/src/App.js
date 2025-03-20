import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import MeetingsPage from './pages/MeetingsPage';
import ClientDetail from './pages/ClientDetail';
import MeetingDetail from './pages/MeetingDetail';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import './App.css';
import config from './config';

// Set axios defaults
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking authentication...");

        const response = await axios.get(`${config.apiUrl}/api/auth/me`, { withCredentials: true });
        console.log("✅ Auth check response:", response.data);

        if (response.data.user) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("❌ Authentication check failed:", error);

        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login success
  const handleLogin = (userData) => {
    console.log('Setting user data after login:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");

      await axios.post(`${config.apiUrl}/api/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Show loading screen before auth check completes
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/clients" 
          element={isAuthenticated ? <ClientsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/clients/:id" 
          element={isAuthenticated ? <ClientDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/meetings" 
          element={isAuthenticated ? <MeetingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/meetings/:id" 
          element={isAuthenticated ? <MeetingDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings" 
          element={isAuthenticated ? <SettingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;