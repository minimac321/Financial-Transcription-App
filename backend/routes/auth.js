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
    // First try to find user in the database
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    
    if (user && user.password === password) {
      // Authenticated - set session
      req.session.user = {
        id: user.id,
        username: user.username,
      };
      return res.status(200).json({ 
        message: 'Login successful', 
        user: { id: user.id, username: user.username } 
      });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  res.status(401).json({ message: 'Not authenticated' });
});

module.exports = router;