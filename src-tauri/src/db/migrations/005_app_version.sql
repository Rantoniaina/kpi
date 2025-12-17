-- App version tracking table
CREATE TABLE IF NOT EXISTS app_version (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    version TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial version if table is empty
INSERT OR IGNORE INTO app_version (id, version) VALUES (1, '0.1.0');

