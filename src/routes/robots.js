const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { dbManager } = require('../config/database');

// Validation schema
const robotSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  model: Joi.string().min(3).max(50).required(),
  status: Joi.string().valid('Active', 'Maintenance', 'Offline').required(),
  location: Joi.string().max(100),
  battery_level: Joi.number().min(0).max(100),
  assigned_task: Joi.string().max(200)
});

// GET all robots
router.get('/', async (req, res) => {
  try {
    const result = await dbManager.getAllRobots();
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
      storage_type: dbManager.useFileStorage ? 'file' : 'database'
    });
  } catch (error) {
    console.error('Error fetching robots:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch robots',
      details: error.message
    });
  }
});

// GET robot by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbManager.getRobotById(id);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Robot not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching robot:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch robot',
      details: error.message
    });
  }
});

// POST create new robot
router.post('/', async (req, res) => {
  try {
    const { error, value } = robotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const result = await dbManager.createRobot(value);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Robot created successfully'
    });
  } catch (error) {
    console.error('Error creating robot:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create robot',
      details: error.message
    });
  }
});

// PUT update robot
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = robotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const result = await dbManager.updateRobot(id, value);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Robot not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Robot updated successfully'
    });
  } catch (error) {
    console.error('Error updating robot:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update robot',
      details: error.message
    });
  }
});

// DELETE robot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbManager.deleteRobot(id);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Robot not found' 
      });
    }

    res.json({
      success: true,
      message: 'Robot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting robot:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete robot',
      details: error.message
    });
  }
});

// GET robots by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['Active', 'Maintenance', 'Offline'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status' 
      });
    }

    const result = await query('SELECT * FROM robots WHERE status = $1', [status]);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch robots by status' 
    });
  }
});

// POST maintenance log
router.post('/:id/maintenance', async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenance_type, description, performed_by } = req.body;

    // Check if robot exists
    const robotCheck = await query('SELECT id FROM robots WHERE id = $1', [id]);
    if (robotCheck.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Robot not found' 
      });
    }

    // Insert maintenance log
    const result = await query(
      `INSERT INTO maintenance_logs (robot_id, maintenance_type, description, performed_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [id, maintenance_type, description, performed_by]
    );

    // Update robot's last maintenance date
    await query(
      'UPDATE robots SET last_maintenance = CURRENT_DATE WHERE id = $1',
      [id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Maintenance log created successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create maintenance log' 
    });
  }
});

module.exports = router;