const express = require('express');
const router = express.Router();
const { dbManager } = require('../config/database');
const os = require('os');

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    application: {
      name: process.env.APP_NAME || "Tim Warner's Teaching Robot Fleet",
      version: require('../../package.json').version,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    },
    system: {
      platform: os.platform(),
      architecture: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg()
    },
    database: await dbManager.getHealthStatus()
  };

  // Set overall status based on database health
  if (!healthInfo.database.connected) {
    healthInfo.status = 'degraded';
  }

  res.status(healthInfo.status === 'healthy' ? 200 : 503).json(healthInfo);
});

// Readiness probe for Kubernetes/Azure
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await dbManager.getHealthStatus();
    if (dbHealth.connected) {
      res.json({ 
        ready: true, 
        storage_type: dbHealth.storage_type,
        environment: dbHealth.environment
      });
    } else {
      res.status(503).json({ 
        ready: false, 
        error: 'Database not ready',
        storage_type: dbHealth.storage_type
      });
    }
  } catch (error) {
    res.status(503).json({ 
      ready: false, 
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Liveness probe for Kubernetes/Azure
router.get('/live', (req, res) => {
  res.json({ alive: true });
});

module.exports = router;