// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

// Secret key for signing JWT tokens - store in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = '24h'; // 24 hours

// Generate a JWT token for a user
const generateToken = (user) => {
    console.log('Generating token for user:', user.username);

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
    console.log('Token generated successfully');
    return token;

};

// Verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET
};