const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const sanitize = require('./src/middleware/sanitize');

dotenv.config();

// Fail fast: never run with a missing or weak JWT signing key (forgeable tokens).
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is missing or shorter than 32 characters. Refusing to start.');
  process.exit(1);
}


const app = express();
const PORT = process.env.PORT || 5000;

// Behind Vercel's proxy — trust the first proxy hop so rate limiters and any
// IP-based logic see the real client IP (from X-Forwarded-For) rather than the proxy.
app.set('trust proxy', 1);

// CORS: allow only origins from the env allowlist (comma-separated). Never reflect
// arbitrary origins together with credentials. Requests with no Origin (e.g. the
// SMS forwarder, curl, health checks) are allowed through.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Security headers.
app.use(helmet());

// Cap request body size to blunt oversized-payload DoS.
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
// Strip Mongo operator keys ($..., dotted paths) from body/params.
app.use(sanitize);
// app.use(morgan('dev'));
// Routes
const authRoutes = require('./src/routes/authRoutes');
const moduleRoutes = require('./src/routes/moduleRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const canteenRoutes = require('./src/routes/canteenRoutes');
const khataRoutes = require('./src/routes/khataRoutes');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expenseflow';
function connectDB() {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
}

let isConnected = false;

const connectInServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    isConnected = true;
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectInServer();
  }
  next();
});

app.get("/api/verify", (req, res) => {
  res.send("Hello from Vercel!");
});

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/khata', khataRoutes);
app.use('/api/v1/webhooks', require('./src/routes/webhookRoutes'));

app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

app.get('/', (req, res) => {
  res.send('ExpenseFlow API is running (JS)...');
});

// 404 Handler for Debugging
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: ['/api/auth/login', '/api/auth/register', '/api/auth/me']
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = app;