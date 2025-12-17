use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::db::migrations::run_migrations;

/// Get the application data directory
pub fn get_app_data_dir() -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().expect("Could not find home directory");
        home.join("Library")
            .join("Application Support")
            .join("kpi-tool")
    }
    #[cfg(target_os = "linux")]
    {
        // Linux: ~/.local/share/kpi-tool/
        dirs::data_local_dir()
            .expect("Could not find data directory")
            .join("kpi-tool")
    }
    #[cfg(target_os = "windows")]
    {
        // Windows: %APPDATA%\kpi-tool\
        dirs::data_dir()
            .expect("Could not find data directory")
            .join("kpi-tool")
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    {
        // Fallback for other platforms
        dirs::home_dir()
            .expect("Could not find home directory")
            .join(".kpi-tool")
    }
}

/// Get the database file path
pub fn get_db_path() -> PathBuf {
    get_app_data_dir().join("kpi.db")
}

/// Initialize the database connection and run migrations
pub fn init_db() -> Result<Connection, String> {
    let app_dir = get_app_data_dir();

    // Create the app data directory if it doesn't exist
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app directory: {}", e))?;
    }

    let db_path = get_db_path();

    // Check if database file exists and is corrupted
    if db_path.exists() {
        // Try to open and verify integrity
        match Connection::open(&db_path) {
            Ok(conn) => {
                // Check database integrity
                let integrity_check: String = conn
                    .query_row("PRAGMA integrity_check", [], |row| row.get(0))
                    .unwrap_or_else(|_| "ok".to_string());

                if integrity_check != "ok" {
                    return Err(format!(
                        "Database corruption detected. Please restore from a backup. Error: {}",
                        integrity_check
                    ));
                }
            }
            Err(e) => {
                // Database file exists but can't be opened - likely corrupted
                return Err(format!(
                    "Database file appears to be corrupted. Please restore from a backup. Error: {}",
                    e
                ));
            }
        }
    }

    let conn =
        Connection::open(&db_path).map_err(|e| {
            if e.to_string().contains("not a database") || e.to_string().contains("malformed") {
                format!("Database file is corrupted. Please restore from a backup or delete the database file to start fresh.")
            } else {
                format!("Failed to open database: {}", e)
            }
        })?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| format!("Failed to enable foreign keys: {}", e))?;

    // Run migrations
    run_migrations(&conn)?;

    // Ensure app version is set (migration 005 creates the table, but we ensure version is current)
    let current_version = env!("CARGO_PKG_VERSION");
    conn.execute(
        "INSERT OR REPLACE INTO app_version (id, version, updated_at) VALUES (1, ?1, CURRENT_TIMESTAMP)",
        [current_version],
    )
    .map_err(|e| format!("Failed to set app version: {}", e))?;

    Ok(conn)
}

/// Database state wrapper for thread-safe access
pub struct DbState(pub Mutex<Connection>);

impl DbState {
    pub fn new() -> Result<Self, String> {
        let conn = init_db()?;
        Ok(DbState(Mutex::new(conn)))
    }
}
