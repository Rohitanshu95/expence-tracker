const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not defined in .env file');
}


const app = express();
const PORT = process.env.PORT || 5000;

const baseFrontendUrl = process.env.NODE_ENV === "development" ? "http://localhost:5173" : "https://my-expence-tracckker.vercel.app";

// Middleware
const allowedOrigins = ["https://my-expence-tracckker.vercel.app"];

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Explicitly handle preflight OPTIONS requests


app.use(express.json());
app.use(cookieParser());
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