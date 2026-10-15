const jwt = require('jsonwebtoken');

// Protects routes: only lets the request through if it carries a valid JWT.
// The client sends the token in the header:  Authorization: Bearer <token>
function auth(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = header.split(' ')[1]; // take the part after "Bearer "

  try {
    // verify() checks the signature with our secret and checks expiry.
    // It throws an error if the token was changed or has expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // controllers use req.user.id to find the owner
    next(); // continue to the actual route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}

module.exports = auth;
