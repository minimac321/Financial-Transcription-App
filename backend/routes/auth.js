const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');


// Login Route
router.post('/login', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://financial-transcription-app-fe.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');

  const { username, password } = req.body;

  try {
    console.log('Login attempt for:', username);
    
    // Find user in database
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log(`Found user in DB: ${user}`);
      
    if (user && user.password === password) {
      // Set user in session
      req.session.user = {id: user.id, username: user.username};
      console.log('✅ User set in session:', req.session.user);

      // 🔥 **Manually trigger session persistence BEFORE responding**
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('🔥 Error saving session:', err);
            reject(res.status(500).json({ message: 'Session save failed' }));
          } else {
            resolve();
          }
        });
      });

      // 🔥 Send `Set-Cookie` in the response so the frontend receives the session ID
      res.setHeader('Set-Cookie', `connect.sid=${req.sessionID}; Path=/; HttpOnly; Secure; SameSite=None`);
      
      // // Force session save before responding
      // req.session.save(async (err) => {
      //   if (err) {
      //     console.error('Error saving session:', err);
      //     return res.status(500).json({ message: 'Session save failed' });
      //   }
      // 🔍 Verify Redis now contains user
      // const storedSession = await redisClient.get(`sess:${req.sessionID}`);
      // console.log('🔍 Stored Redis Session ID After Save:', storedSession);

      // Force Session Save & Send Cookies in Response 
      // res.setHeader('Set-Cookie', `connect.sid=${req.session.id}; Path=/; HttpOnly; Secure; SameSite=None`);
      
      return res.status(200).json({ 
        message: 'Login successful', 
        user: { id: user.id, username: user.username } 
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
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('financeAppSession');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'No active session' });
  }
});

// Check Authenticated User
router.get('/me', (req, res) => {
  console.log('Checking current session:', req.session);
  console.log('Session ID:', req.sessionID);
  console.log('Session user:', req.session.user);

  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  res.status(401).json({ message: 'Not authenticated' });
});


// router.post("/register", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Insert user into the database
//       await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", 
//                      [username, hashedPassword]);

//       res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//       console.error("Registration error:", error);
//       res.status(500).json({ message: "Error creating user" });
//   }
// });

module.exports = router;