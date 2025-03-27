const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Google Auth Routes for Users
router.get('/google',
  passport.authenticate('google-user', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google-user', {
    session: true,
    failureRedirect: '/',
  }),
  async (req, res) => {
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
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/');
      }
      res.redirect(process.env.FRONTEND_URL + 'user-dashboard');
    });
  }
);

// Check authentication status for Users
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ isAuthenticated: true, user: req.user });
  }

  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        User.findById(decoded.id)
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

// Logout route for Users
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }

    // Clear authentication token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    // Remove the token from session or user object
    if (req.user) {
      req.user.token = null; 
    }
    if (req.session) {
      req.session.token = null;
    }

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Error clearing session' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});


module.exports = router;
