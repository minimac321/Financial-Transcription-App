// backend/middleware/auth.js
const { verifyToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Cookies received:', req.cookies);
  console.log('Auth header:', req.headers.authorization);
  
  // Try JWT from authorization header first
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // If no token in header, try from cookie
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    console.log('No JWT token found (neither in header nor cookie)');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  // Verify the token
  const decodedToken = verifyToken(token);
  
  if (!decodedToken) {
    console.log('JWT verification failed');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
  
  console.log('JWT verified successfully for user:', decodedToken.username);
  
  // Set user in request object
  req.user = decodedToken;
  next();
};