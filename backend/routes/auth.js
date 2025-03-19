const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('../db');

// CSV-based authentication (for development)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    console.log('Login attempt for:', username);
    
    // Find user in database
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    
    if (user && user.password === password) {
      // Set user in session
      req.session.user = {
        id: user.id,
        username: user.username,
      };
      
      // Force session save before responding
      req.session.save(err => {
        if (err) {
          console.error('Error saving session:', err);
          return res.status(500).json({ message: 'Error during login' });
        }
        
        console.log('User set in session:', req.session.user);
        console.log('Complete session after login:', req.session);
        
        return res.status(200).json({ 
          message: 'Login successful', 
          user: { id: user.id, username: user.username } 
        });
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/logout', (req, res) => {
  // Destroy the session even if user wasn't authenticated
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    // Session already gone, just return success
    res.status(200).json({ message: 'Logged out successfully' });
  }
});



router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  res.status(401).json({ message: 'Not authenticated' });
});

module.exports = router;