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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // exposedHeaders: ['set-cookie'] // ✅ Ensure cookies are accessible
}));
// For debugging CORS during development
app.use((req, res, next) => {
  console.log('Request from origin:', req.headers.origin);
  console.log('Request cookies:', req.cookies);
  next();
});

// 🔥 Ensure OPTIONS requests are handled properly
// app.options('*', cors());

// Body parsers
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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