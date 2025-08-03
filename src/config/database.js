const DatabaseManager = require('../db/database-manager');

// Create singleton instance
const dbManager = new DatabaseManager();

// Initialize database on module load
let initializationPromise = null;

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = dbManager.initialize();
  }
  return initializationPromise;
}

// Legacy query function for backward compatibility
async function query(text, params) {
  if (dbManager.useFileStorage) {
    throw new Error('Direct SQL queries not supported with file storage. Use DatabaseManager methods.');
  }
  return await dbManager.query(text, params);
}

// Export both new and legacy interfaces
module.exports = {
  // New interface
  dbManager,
  
  // Legacy interface for backward compatibility
  pool: dbManager.pool,
  query,
  initializeDatabase
};