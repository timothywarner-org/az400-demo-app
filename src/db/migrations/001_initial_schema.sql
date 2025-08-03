-- Migration 001: Initial Schema
-- Tim Warner's Teaching Robot Fleet - Initial Database Setup

-- Create robots table
CREATE TABLE IF NOT EXISTS robots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Active', 'Maintenance', 'Offline')) DEFAULT 'Offline',
    location VARCHAR(100),
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100) DEFAULT 100,
    last_maintenance DATE,
    assigned_task VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id SERIAL PRIMARY KEY,
    robot_id INTEGER REFERENCES robots(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create database metadata table for migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Record this migration
INSERT INTO schema_migrations (version, description) 
VALUES ('001', 'Initial schema - robots and maintenance_logs tables')
ON CONFLICT (version) DO NOTHING;