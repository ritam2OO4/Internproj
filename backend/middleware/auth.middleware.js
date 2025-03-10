const jwt = require("jsonwebtoken")
const Business = require('../models/business.model');

const authMiddleware = async (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  
  // Check JWT as fallback
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        // Find and set the user
        const user = await Business.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        return next();
      }
    } catch (err) {
      console.log(err.message)
      // Token itnvalid/expired
    }
  }
  
  res.status(401).json({ error: 'Unauthorized' });
};

module.exports = authMiddleware; 