const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// 1. Helmet security headers (as first middleware)
app.use(helmet());

// 2. Cookie parser middleware
app.use(cookieParser());

// 3. CORS configuration with credentials support
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 4. Body parser limits
app.use(express.json({ limit: '10mb' }));

// 5. Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests" }
});

app.use('/api', generalLimiter);
app.use('/api/doctors/login',     authLimiter);
app.use('/api/patients/login',    authLimiter);
app.use('/api/doctors/register',  authLimiter);
app.use('/api/patients/register', authLimiter);
app.use('/api/admin/login',       authLimiter);

// 6. Socket.io setup
const io = new Server(httpServer, {
  cors: { origin: allowedOrigin, credentials: true }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
  });
  socket.on('disconnect', () => {
    connectedUsers.forEach((v, k) => { if (v === socket.id) connectedUsers.delete(k); });
  });
});

app.set('io', io);
app.set('connectedUsers', connectedUsers);

// 7. Routes
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Medical Portal API is running', database: process.env.MONGODB_URI });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// 8. 404 — route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// 9. Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});