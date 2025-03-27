const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Business = require('../models/business.model');

// Google Auth Routes
router.get('/google',
  passport.authenticate('google-business', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google-business', { 
    session: true,
    failureRedirect: '/',
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/');
    }

    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    // Set session cookie
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/');
      }
      // Ensure the session is properly set
      if (!req.session.passport || !req.session.passport.user) {
        console.error('Session not properly set');
        return res.redirect('/');
      }
      res.redirect(process.env.FRONTEND_URL + 'dashboard');
    });
  }
);

// Check authentication status
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
    return;
  }

  // Check JWT as fallback
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        Business.findById(decoded.id)
          .then(user => {
            if (user) {
              return res.json({ isAuthenticated: true, user });
            }
            res.json({ isAuthenticated: false });
          })
          .catch(() => res.json({ isAuthenticated: false }));
        return;
      }
    } catch (err) {
      // Token invalid/expired
    }
  }

  res.json({ isAuthenticated: false });
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    // Clear both the token and session
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router; 