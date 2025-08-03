const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.useFileStorage = false;
    this.dataFile = path.join(__dirname, '..', '..', 'data', 'robots.json');
    this.environment = process.env.NODE_ENV || 'development';
    
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || this.getDefaultDbName(),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }

  getDefaultDbName() {
    const baseName = 'robotfleet';
    switch (this.environment) {
      case 'test': return `${baseName}_test`;
      case 'staging': return `${baseName}_staging`;
      case 'production': return baseName;
      default: return `${baseName}_dev`;
    }
  }

  async initialize() {
    console.log(`🔧 Initializing database for environment: ${this.environment}`);
    
    try {
      // Try to connect to PostgreSQL first
      await this.connectToPostgreSQL();
      await this.runMigrations();
      await this.seedDatabase();
      console.log('✅ PostgreSQL database initialized successfully');
    } catch (error) {
      console.warn('⚠️  PostgreSQL connection failed, falling back to file storage:', error.message);
      await this.initializeFileStorage();
    }
  }

  async connectToPostgreSQL() {
    this.pool = new Pool(this.dbConfig);
    
    // Test connection
    const client = await this.pool.connect();
    try {
      await client.query('SELECT NOW()');
      this.isConnected = true;
      console.log(`✅ Connected to PostgreSQL database: ${this.dbConfig.database}`);
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = await fs.readdir(migrationsDir);
    const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migrationSql = await fs.readFile(migrationPath, 'utf8');
      
      try {
        await this.pool.query(migrationSql);
        console.log(`✅ Applied migration: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to apply migration ${file}:`, error.message);
        throw error;
      }
    }
  }

  async seedDatabase() {
    console.log(`🌱 Seeding database for ${this.environment} environment...`);
    
    const seedFile = `${this.environment}_data.sql`;
    const seedPath = path.join(__dirname, 'seeds', seedFile);
    
    try {
      const seedSql = await fs.readFile(seedPath, 'utf8');
      await this.pool.query(seedSql);
      console.log(`✅ Database seeded with ${this.environment} data`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`ℹ️  No seed file found for ${this.environment} environment`);
      } else {
        console.warn(`⚠️  Failed to seed database:`, error.message);
      }
    }
  }

  async initializeFileStorage() {
    console.log('📁 Initializing file-based storage...');
    this.useFileStorage = true;
    
    const dataDir = path.dirname(this.dataFile);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }

    // Check if data file exists, create with sample data if not
    try {
      await fs.access(this.dataFile);
      console.log('✅ Using existing file storage');
    } catch (error) {
      await this.createInitialFileData();
      console.log('✅ Created initial file storage with sample data');
    }
  }

  async createInitialFileData() {
    const initialData = {
      robots: [
        {
          id: 1,
          name: 'Alpha-Teaching-Bot',
          model: 'EDU-3000',
          status: 'Active',
          location: 'Training Lab A',
          battery_level: 95,
          last_maintenance: '2025-01-15',
          assigned_task: 'Student Demonstrations',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Beta-Assistant',
          model: 'EDU-2500',
          status: 'Active',
          location: 'Classroom B',
          battery_level: 82,
          last_maintenance: '2025-01-20',
          assigned_task: 'Lab Assistance',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Gamma-Presenter',
          model: 'EDU-3000',
          status: 'Maintenance',
          location: 'Service Bay',
          battery_level: 45,
          last_maintenance: '2025-01-10',
          assigned_task: 'Under Repair',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      maintenance_logs: [
        {
          id: 1,
          robot_id: 1,
          maintenance_type: 'Routine Check',
          description: 'Weekly inspection and calibration',
          performed_by: 'Tim Warner',
          performed_at: new Date().toISOString()
        }
      ],
      metadata: {
        environment: this.environment,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }
    };

    await fs.writeFile(this.dataFile, JSON.stringify(initialData, null, 2));
  }

  async query(text, params = []) {
    if (this.useFileStorage) {
      throw new Error('SQL queries not supported with file storage. Use specific methods.');
    }

    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // File storage methods
  async readFileData() {
    if (!this.useFileStorage) {
      throw new Error('Not using file storage');
    }

    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading file data:', error);
      throw error;
    }
  }

  async writeFileData(data) {
    if (!this.useFileStorage) {
      throw new Error('Not using file storage');
    }

    data.metadata = {
      ...data.metadata,
      last_updated: new Date().toISOString()
    };

    await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
  }

  // Unified methods that work with both PostgreSQL and file storage
  async getAllRobots() {
    if (this.useFileStorage) {
      const data = await this.readFileData();
      return { rows: data.robots, rowCount: data.robots.length };
    } else {
      return await this.query('SELECT * FROM robots ORDER BY id');
    }
  }

  async getRobotById(id) {
    if (this.useFileStorage) {
      const data = await this.readFileData();
      const robot = data.robots.find(r => r.id === parseInt(id));
      return { rows: robot ? [robot] : [], rowCount: robot ? 1 : 0 };
    } else {
      return await this.query('SELECT * FROM robots WHERE id = $1', [id]);
    }
  }

  async createRobot(robotData) {
    if (this.useFileStorage) {
      const data = await this.readFileData();
      const newId = Math.max(...data.robots.map(r => r.id), 0) + 1;
      const newRobot = {
        id: newId,
        ...robotData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      data.robots.push(newRobot);
      await this.writeFileData(data);
      return { rows: [newRobot], rowCount: 1 };
    } else {
      const { name, model, status, location, battery_level, assigned_task } = robotData;
      return await this.query(
        `INSERT INTO robots (name, model, status, location, battery_level, assigned_task) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [name, model, status, location, battery_level, assigned_task]
      );
    }
  }

  async updateRobot(id, robotData) {
    if (this.useFileStorage) {
      const data = await this.readFileData();
      const robotIndex = data.robots.findIndex(r => r.id === parseInt(id));
      if (robotIndex === -1) {
        return { rows: [], rowCount: 0 };
      }
      
      data.robots[robotIndex] = {
        ...data.robots[robotIndex],
        ...robotData,
        updated_at: new Date().toISOString()
      };
      await this.writeFileData(data);
      return { rows: [data.robots[robotIndex]], rowCount: 1 };
    } else {
      const { name, model, status, location, battery_level, assigned_task } = robotData;
      return await this.query(
        `UPDATE robots 
         SET name = $1, model = $2, status = $3, location = $4, 
             battery_level = $5, assigned_task = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 
         RETURNING *`,
        [name, model, status, location, battery_level, assigned_task, id]
      );
    }
  }

  async deleteRobot(id) {
    if (this.useFileStorage) {
      const data = await this.readFileData();
      const robotIndex = data.robots.findIndex(r => r.id === parseInt(id));
      if (robotIndex === -1) {
        return { rows: [], rowCount: 0 };
      }
      
      const deletedRobot = data.robots[robotIndex];
      data.robots.splice(robotIndex, 1);
      
      // Also remove related maintenance logs
      data.maintenance_logs = data.maintenance_logs.filter(log => log.robot_id !== parseInt(id));
      
      await this.writeFileData(data);
      return { rows: [{ id: deletedRobot.id }], rowCount: 1 };
    } else {
      return await this.query('DELETE FROM robots WHERE id = $1 RETURNING id', [id]);
    }
  }

  async getHealthStatus() {
    const status = {
      storage_type: this.useFileStorage ? 'file' : 'postgresql',
      environment: this.environment,
      connected: this.useFileStorage || this.isConnected,
      database_name: this.useFileStorage ? this.dataFile : this.dbConfig.database
    };

    if (this.useFileStorage) {
      try {
        const data = await this.readFileData();
        status.robot_count = data.robots.length;
        status.last_updated = data.metadata.last_updated;
      } catch (error) {
        status.error = error.message;
        status.connected = false;
      }
    } else if (this.isConnected) {
      try {
        const result = await this.query('SELECT COUNT(*) as count FROM robots');
        status.robot_count = parseInt(result.rows[0].count);
      } catch (error) {
        status.error = error.message;
        status.connected = false;
      }
    }

    return status;
  }

  async close() {
    if (this.pool && this.isConnected) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 Database connection closed');
    }
  }
}

module.exports = DatabaseManager;