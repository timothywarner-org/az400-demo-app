const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const robotRoutes = require('./routes/robots');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/robots', robotRoutes);

// Web routes
app.get('/', (req, res) => {
  res.render('dashboard', { 
    title: "Tim Warner's Teaching Robot Fleet",
    appName: process.env.APP_NAME || "Tim Warner's Teaching Robot Fleet"
  });
});

app.get('/robots', (req, res) => {
  res.render('robots', { 
    title: 'Robot Fleet Management',
    appName: process.env.APP_NAME || "Tim Warner's Teaching Robot Fleet"
  });
});

app.get('/robot/:id', (req, res) => {
  res.render('robot-detail', { 
    title: 'Robot Details',
    appName: process.env.APP_NAME || "Tim Warner's Teaching Robot Fleet",
    robotId: req.params.id
  });
});

app.get('/maintenance', (req, res) => {
  res.render('maintenance', { 
    title: 'Maintenance Dashboard',
    appName: process.env.APP_NAME || "Tim Warner's Teaching Robot Fleet"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`🤖 Tim Warner's Teaching Robot Fleet running on http://localhost:${PORT}`);
      logger.info(`📚 AZ-400 Demo Application - Ready for DevOps!`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;