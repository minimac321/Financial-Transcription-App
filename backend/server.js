const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'finance-transcription-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false, // IMPORTANT: Change to false for localhost development
    sameSite: 'lax'
  }

  // secret: process.env.SESSION_SECRET || 'finance-transcription-secret',
  // resave: false,
  // saveUninitialized: false,
  // cookie: { 
  //   maxAge: 24 * 60 * 60 * 1000, // 24 hours
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
  //   sameSite: 'lax' // Try 'none' if using different domains, but requires secure:true
  // }
}));


// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
// To this:
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://financial-transcription-app-fe.onrender.com' 
    : 'http://localhost:3000',
  credentials: true,  // This is essential
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
//     sameSite: 'none', // May be needed for cross-site cookies
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));


// CSV-based authentication (temporary)
app.use((req, res, next) => {
  console.log('------------------------------');
  console.log('Request path:', req.path);
  console.log('Request cookies:', req.headers.cookie);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  
  // Skip auth middleware for auth routes
  if (req.path.startsWith('/api/auth/')) {
    console.log('Skipping auth check for auth route');
    return next();
  }
  
  // Check if user is authenticated
  if (!req.session.user) {
    console.log('No user in session, returning 401');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  console.log('User is authenticated:', req.session.user);
  next();
  console.log('------------------------------');
});

// Routes (make sure all are properly registered)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/transcripts', require('./routes/transcripts')); // This line is crucial

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});