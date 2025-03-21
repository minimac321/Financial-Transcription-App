import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ClientDetail from './pages/ClientDetail';
import MeetingsPage from './pages/MeetingsPage';
import MeetingDetail from './pages/MeetingDetail';
import NotFound from './pages/NotFound';
import SettingsPage from './pages/SettingsPage';
// import other components
import './App.css';
import config from './config';


// Set up axios with JWT token
let jwtToken = sessionStorage.getItem('jwtToken');
console.log("jwtToken:", jwtToken);

// Set axios defaults
axios.defaults.withCredentials = true;

// Interceptor to add the token to every request
axios.interceptors.request.use(
  (config) => {
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking authentication...");
        console.log("Token in sessionStorage:", jwtToken);
        
        // Skip check if no token exists
        if (!jwtToken) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${config.apiUrl}/api/auth/me`);
        console.log("✅ Auth check response:", response.data);
    
        if (response.data.user) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          // Handle case where response succeeded but no user data
          console.log("No user data in response");
          setIsAuthenticated(false);
          setUser(null);
          sessionStorage.removeItem('jwtToken');
          jwtToken = null;
        }
      } catch (error) {
        console.error("❌ Authentication check failed:", error);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);

        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('jwtToken');
        jwtToken = null;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login success
  const handleLogin = (userData, token) => {
    jwtToken = token;
    sessionStorage.setItem('jwtToken', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/api/auth/logout`);
    } finally {
      sessionStorage.removeItem('jwtToken');
      jwtToken = null;
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