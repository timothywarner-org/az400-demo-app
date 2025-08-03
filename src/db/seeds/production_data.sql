-- Production Environment Sample Data
-- Tim Warner's Teaching Robot Fleet

-- Clear existing data (for re-seeding) - USE WITH CAUTION IN PRODUCTION
TRUNCATE TABLE maintenance_logs, robots RESTART IDENTITY CASCADE;

-- Insert production robots (minimal, professional data)
INSERT INTO robots (name, model, status, location, battery_level, last_maintenance, assigned_task) VALUES
('Teaching-Unit-01', 'EDU-3000', 'Active', 'O''Reilly Studio A', 98, CURRENT_DATE - INTERVAL '2 days', 'Live Learning Sessions'),
('Teaching-Unit-02', 'EDU-3000', 'Active', 'O''Reilly Studio B', 94, CURRENT_DATE - INTERVAL '1 day', 'Course Demonstrations');

-- Insert production maintenance logs
INSERT INTO maintenance_logs (robot_id, maintenance_type, description, performed_by) VALUES
(1, 'Pre-session Check', 'Routine inspection before O''Reilly Live Learning session', 'Technical Support'),
(2, 'Calibration', 'Sensor calibration for optimal performance', 'Technical Support');