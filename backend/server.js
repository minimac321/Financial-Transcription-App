const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

// Load environment variables
dotenv.config();

console.log('🚀 Running in NODE_ENV:', process.env.NODE_ENV);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;


// 🔹 Configure Redis Client (Production & Local)
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'; // Default to local Redis if no env var

const redisClient = redis.createClient({
  url: REDIS_URL.includes('rediss://') ? REDIS_URL : REDIS_URL.replace('rediss://', 'redis://'), // Ensure correct URL format
  socket: process.env.NODE_ENV === 'production' ? { tls: true } : {} // Enable TLS in production
});
redisClient.on('error', err => console.error('🔥 Redis Connection Error:', err));
redisClient.connect().catch(console.error);


// CORS configuration - must come BEFORE session middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration - MIDDLEWARE
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'finance-transcription-secret',
  resave: false,
  saveUninitialized: false,
  name: 'financeAppSession', // Cookie name
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // Enable only on HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }
}));

// Move cookieParser AFTER session middleware
app.use(cookieParser());


// Debug middleware
app.use((req, res, next) => {
  console.log('--- SESSION DEBUG ---');
  console.log('Incoming Request Path:', req.path);
  console.log('Incoming Cookies:', req.headers.cookie);
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  next();
});

// ✅ Ensure session is saved before sending response
app.use((req, res, next) => {
  if (req.session) {
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
      }
      next();
    });
  } else {
    next();
  }
});


// Auth middleware
app.use((req, res, next) => {
  // Skip auth middleware for auth routes and OPTIONS requests
  if (req.path.startsWith('/api/auth/') || req.method === 'OPTIONS') {
    console.log('Skipping auth check for route:', req.path);
    return next();
  }
  
  // Check if user is authenticated
  if (!req.session.user) {
    console.log('No user in session, returning 401');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  console.log('User is authenticated:', req.session.user);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/transcripts', require('./routes/transcripts'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});