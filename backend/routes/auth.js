const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateToken } = require('../utils/jwt');
const authMiddleware = require('../middleware/auth'); // Import the middleware properly
const bcrypt = require('bcrypt'); // Add this line to import bcrypt

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('Login attempt for:', username);
    
    // Find user in database
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    console.log(`Found user in DB: ${user.username}`);

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
      
    if (user && isPasswordValid) {
      // Generate JWT token
      const token = generateToken(user);

      // Set JWT in an HttpOnly cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

      console.log('Generated token:', token.substring(0, 20) + '...'); // Debug log (don't log full token)

      return res.status(200).json({ 
        message: 'Login successful', 
        user: { id: user.id, username: user.username },
        token: token
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Check Authenticated User - apply the middleware
router.get('/me', authMiddleware, (req, res) => {
  // Since the middleware verified the token and added user to req
  return res.status(200).json({ user: req.user });
});

module.exports = router;