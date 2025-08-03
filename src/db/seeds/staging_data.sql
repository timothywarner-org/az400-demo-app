-- Staging Environment Sample Data
-- Tim Warner's Teaching Robot Fleet

-- Clear existing data (for re-seeding)
TRUNCATE TABLE maintenance_logs, robots RESTART IDENTITY CASCADE;

-- Insert staging robots (production-like but limited data)
INSERT INTO robots (name, model, status, location, battery_level, last_maintenance, assigned_task) VALUES
('Production-Alpha', 'EDU-3000', 'Active', 'Main Lab', 92, '2025-01-20', 'Course Delivery'),
('Production-Beta', 'EDU-2500', 'Active', 'Demo Room', 85, '2025-01-22', 'Live Demonstrations'),
('Production-Gamma', 'EDU-3000', 'Maintenance', 'Service Area', 60, '2025-01-15', 'Pre-production Check');

-- Insert minimal maintenance logs for staging
INSERT INTO maintenance_logs (robot_id, maintenance_type, description, performed_by) VALUES
(1, 'Pre-deployment Check', 'Final inspection before production deployment', 'QA Team'),
(2, 'Software Verification', 'Verified all systems operational for staging', 'DevOps Team'),
(3, 'Hardware Inspection', 'Comprehensive hardware check for production readiness', 'Technical Team');