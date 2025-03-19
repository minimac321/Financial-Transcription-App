import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import MeetingsPage from './pages/MeetingsPage';
import ClientDetail from './pages/ClientDetail';
import MeetingDetail from './pages/MeetingDetail';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import axios from 'axios';
import './App.css';
import config from './config';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/auth/me`, { withCredentials: true });
        if (response.data.user) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    console.log('Setting user data after login:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/api/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // const navigate = useNavigate();  // ✅ Declare it at the top inside the component

  // const handleLogout = async () => {
  //   try {
  //     await axios.post(`${config.apiUrl}/api/auth/logout`, {}, { withCredentials: true });
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //     // Even if the logout request fails, we can still clear the local session state
  //   } finally {
  //     // Always clear the local authentication state
  //     setIsAuthenticated(false);
  //     setUser(null);
  //     navigate('/login');
  //   }
  // };


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