require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth.routes');
const campaignRoutes = require('./routes/campaign.routes');
const referralRoutes = require('./routes/referral.routes');
const AiRoutes = require('./routes/ai.routes');
const AiMailRoutes = require("./routes/AiMailRoutes")
const newUserRoutes = require("./routes/newUserRoutes")
const authUser = require("./routes/auth.user.routes");
const taskRoutes = require("./routes/taskRoutes");
const Business = require('./models/business.model');
const chatbotRoutes = require("./routes/chatbotRoute");
const AIBotRoutes = require("./routes/AIbot");
const TakeTaskRoutes = require("./routes/TakeTaskRoutes");
const User = require('./models/user.model'); // Import User model

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Import and configure passport strategies
require('./config/passport')(passport);      // Business Google Auth
require('./config/passportUser')(passport);  // User Google Auth

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, { id: user.id, type: user instanceof Business ? 'business' : 'user' });
});

passport.deserializeUser(async (obj, done) => {
  try {
    let user;
    if (obj.type === 'business') {
      user = await Business.findById(obj.id);
    } else {
      user = await User.findById(obj.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


// Routes
app.use('/api/user/auth', authUser);
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/ai', AiRoutes);
app.use('/api', AiMailRoutes);
app.use('/api/newUser', newUserRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/bot", AIBotRoutes);
app.use("/api", TakeTaskRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
