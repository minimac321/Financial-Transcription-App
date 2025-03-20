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
  socket: {
    reconnectStrategy: (retries) => {
      console.warn(`🛠️ Redis reconnect attempt #${retries}`);
      if (retries > 10) {
        console.error('❌ Too many Redis reconnection attempts, giving up.');
        return new Error('Redis reconnect failed');
      }
      return Math.min(retries * 100, 3000); // Retry every 100ms, max 3s
    },
    tls: REDIS_URL.startsWith('rediss://') ? {} : undefined, // Enable TLS only for `rediss://`
  }
});

// 🔥 Handle Redis Connection Events
redisClient.on('connect', () => console.log('✅ Connected to Redis'));
redisClient.on('error', (err) => console.error('🔥 Redis Error:', err));
redisClient.on('reconnecting', () => console.warn('🔄 Redis reconnecting...'));
redisClient.on('end', () => console.warn('⚠️ Redis connection closed!'));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established');
  } catch (err) {
    console.error('❌ Redis failed to connect:', err);
  }
})();


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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,  // ✅ Do not create session unless user logs in!
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


// Auth middleware
app.use(async (req, res, next) => {
  console.log('--- SESSION DEBUG ---');
  console.log('Incoming Request Path:', req.path);
  console.log('Incoming Cookies:', req.headers.cookie);
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);


  // Skip auth middleware for auth routes and OPTIONS requests
  if (req.path.startsWith('/api/auth/') || req.method === 'OPTIONS') {
    console.log('Skipping auth check for route:', req.path);
    return next();
  }

  // 🔥 Retrieve session data manually from Redis
  if (req.session && req.session.user) {
    console.log('✅ User is authenticated:', req.session.user);
    return next();
  } else {
    console.log('❌ No user found in session, attempting Redis lookup');

    // Manually look up session from Redis
    const redisSession = await redisClient.get(`sess:${req.sessionID}`);
    console.log('🔍 Retrieved Redis Session:', redisSession);

    // if (redisSession) {
    //   const sessionData = JSON.parse(redisSession);
    //   console.log('🔍 Parsed Redis Session:', sessionData);

    //   if (sessionData.user) {
    //     req.session.user = sessionData.user; // 🔥 Restore user manually
    //     console.log('✅ Redis Session Restored, User:', req.session.user);
    //     return next();
    //   }

    // }
  }

  console.log('❌ Still no valid session, returning 401');
  return res.status(401).json({ message: 'Unauthorized' });
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