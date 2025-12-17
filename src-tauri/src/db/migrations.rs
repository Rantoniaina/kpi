use rusqlite::Connection;

/// Run all database migrations
pub fn run_migrations(conn: &Connection) -> Result<(), String> {
    // Create migrations table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )
    .map_err(|e| format!("Failed to create migrations table: {}", e))?;

    // Run each migration
    let migrations: Vec<(&str, &str)> = vec![
        ("001_initial_schema", include_str!("migrations/001_initial_schema.sql")),
        ("002_bug_resolver", include_str!("migrations/002_bug_resolver.sql")),
        ("003_add_indexes", include_str!("migrations/003_add_indexes.sql")),
        ("004_datetime_fields", include_str!("migrations/004_datetime_fields.sql")),
        ("005_app_version", include_str!("migrations/005_app_version.sql")),
    ];

    for (name, sql) in migrations {
        // Check if migration has already been applied
        let applied: bool = conn
            .query_row(
                "SELECT COUNT(*) > 0 FROM _migrations WHERE name = ?",
                [name],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to check migration status: {}", e))?;

        // For migration 002_bug_resolver, always check if columns exist
        // This handles the case where migration was marked as applied but columns don't exist
        if name == "002_bug_resolver" {
            // Check if resolved_by_developer_id column exists
            let column_exists: bool = conn
                .query_row(
                    "SELECT COUNT(*) > 0 FROM pragma_table_info('bugs') WHERE name = 'resolved_by_developer_id'",
                    [],
                    |row| row.get(0),
                )
                .unwrap_or(false);

            if !column_exists {
                // Run the migration to add missing columns
                conn.execute_batch(sql)
                    .map_err(|e| format!("Failed to run migration {}: {}", name, e))?;
                
                // Record the migration if not already recorded
                if !applied {
                    conn.execute("INSERT INTO _migrations (name) VALUES (?)", [name])
                        .map_err(|e| format!("Failed to record migration {}: {}", name, e))?;
                }
                
                println!("Applied migration: {} (added missing columns)", name);
            } else if !applied {
                // Columns exist but migration not recorded - just record it
                conn.execute("INSERT INTO _migrations (name) VALUES (?)", [name])
                    .map_err(|e| format!("Failed to record migration {}: {}", name, e))?;
                println!("Recorded migration: {} (columns already exist)", name);
            }
        } else if !applied {
            // Run the migration normally
            conn.execute_batch(sql)
                .map_err(|e| format!("Failed to run migration {}: {}", name, e))?;

            // Record the migration
            conn.execute("INSERT INTO _migrations (name) VALUES (?)", [name])
                .map_err(|e| format!("Failed to record migration {}: {}", name, e))?;

            println!("Applied migration: {}", name);
        }
    }

    Ok(())
}

