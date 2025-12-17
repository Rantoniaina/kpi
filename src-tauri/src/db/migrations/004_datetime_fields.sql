-- Migration 004: Convert DATE fields to DATETIME for time precision
-- This allows accurate time-based calculations for delivery metrics

-- Update tickets table: Convert DATE to DATETIME
-- SQLite doesn't support ALTER COLUMN, so we need to:
-- 1. Create new table with DATETIME columns
-- 2. Copy data (converting dates to datetime format)
-- 3. Drop old table
-- 4. Rename new table

-- Step 1: Create new tickets table with DATETIME
CREATE TABLE tickets_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    developer_id TEXT NOT NULL,
    assigned_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    completed_date DATETIME,
    status TEXT CHECK(status IN ('assigned', 'in_progress', 'review', 'completed', 'reopened')) NOT NULL DEFAULT 'assigned',
    estimated_hours REAL,
    actual_hours REAL,
    complexity TEXT CHECK(complexity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    reopen_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Step 2: Copy data, converting DATE to DATETIME (add 00:00:00 time)
INSERT INTO tickets_new
SELECT 
    id,
    title,
    description,
    developer_id,
    assigned_date || ' 00:00:00' as assigned_date,
    due_date || ' 00:00:00' as due_date,
    CASE 
        WHEN completed_date IS NULL THEN NULL
        ELSE completed_date || ' 00:00:00'
    END as completed_date,
    status,
    estimated_hours,
    actual_hours,
    complexity,
    reopen_count,
    created_at,
    updated_at
FROM tickets;

-- Step 3: Drop old table
DROP TABLE tickets;

-- Step 4: Rename new table
ALTER TABLE tickets_new RENAME TO tickets;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_tickets_developer ON tickets(developer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_dates ON tickets(assigned_date, due_date, completed_date);

-- Update bugs table: Convert resolved_date from DATE to DATETIME
CREATE TABLE bugs_new (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    developer_id TEXT NOT NULL,
    reported_by TEXT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    bug_type TEXT CHECK(bug_type IN ('developer_error', 'conceptual', 'requirement_change', 'environment', 'third_party')) NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Copy bugs data, converting resolved_date
INSERT INTO bugs_new
SELECT 
    id,
    ticket_id,
    developer_id,
    reported_by,
    title,
    description,
    severity,
    bug_type,
    is_resolved,
    CASE 
        WHEN resolved_date IS NULL THEN NULL
        ELSE resolved_date || ' 00:00:00'
    END as resolved_date,
    created_at,
    updated_at
FROM bugs;

-- Drop old bugs table
DROP TABLE bugs;

-- Rename new bugs table
ALTER TABLE bugs_new RENAME TO bugs;

-- Recreate bugs indexes
CREATE INDEX IF NOT EXISTS idx_bugs_ticket ON bugs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_bugs_developer ON bugs(developer_id);
CREATE INDEX IF NOT EXISTS idx_bugs_type ON bugs(bug_type);


