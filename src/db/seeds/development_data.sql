-- Development Environment Sample Data
-- Tim Warner's Teaching Robot Fleet

-- Clear existing data (for re-seeding)
TRUNCATE TABLE maintenance_logs, robots RESTART IDENTITY CASCADE;

-- Insert development robots
INSERT INTO robots (name, model, status, location, battery_level, last_maintenance, assigned_task) VALUES
('Alpha-Teaching-Bot', 'EDU-3000', 'Active', 'Training Lab A', 95, '2025-01-15', 'Student Demonstrations'),
('Beta-Assistant', 'EDU-2500', 'Active', 'Classroom B', 82, '2025-01-20', 'Lab Assistance'),
('Gamma-Presenter', 'EDU-3000', 'Maintenance', 'Service Bay', 45, '2025-01-10', 'Under Repair'),
('Delta-Helper', 'EDU-2000', 'Active', 'Storage Room', 100, '2025-01-25', 'Material Transport'),
('Epsilon-Demo', 'EDU-1500', 'Offline', 'Storage Room', 15, '2024-12-20', 'Battery Replacement Needed'),
('Zeta-Backup', 'EDU-2500', 'Active', 'Training Lab B', 88, '2025-01-18', 'Backup Demonstrations');

-- Insert sample maintenance logs
INSERT INTO maintenance_logs (robot_id, maintenance_type, description, performed_by) VALUES
(1, 'Routine Check', 'Weekly inspection and calibration', 'Tim Warner'),
(2, 'Software Update', 'Updated to latest teaching firmware v2.1', 'System Admin'),
(3, 'Hardware Repair', 'Replaced faulty servo motor in left arm', 'Maintenance Team'),
(4, 'Battery Replacement', 'Installed new high-capacity battery pack', 'Tim Warner'),
(5, 'Calibration', 'Recalibrated sensors after transport', 'Lab Assistant'),
(1, 'Cleaning', 'Deep cleaning before demo session', 'Maintenance Team');