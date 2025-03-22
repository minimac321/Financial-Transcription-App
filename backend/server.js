const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


// Load environment variables
dotenv.config();

console.log('🚀 Running in NODE_ENV:', process.env.NODE_ENV);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'] // ✅ Ensure cookies are accessible
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// For debugging CORS during development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://financial-transcription-app-fe.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  console.log('Request from origin:', req.headers.origin);
  console.log('Request cookies:', req.cookies);
  next();
});


// Body parsers
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/transcripts', require('./routes/transcripts'));
app.use('/api/settings', require('./routes/settings'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this to server.js to test CORS
app.get('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});