use crate::db::DbState;
use crate::models::{Bug, BugSeverity, BugType, CreateBugInput, UpdateBugInput};
use chrono::Utc;
use tauri::State;
use uuid::Uuid;

/// Helper to parse a bug from a database row
pub fn parse_bug_row(row: &rusqlite::Row) -> Result<Bug, rusqlite::Error> {
    let severity_str: String = row.get(6)?;
    let bug_type_str: String = row.get(7)?;
    Ok(Bug {
        id: row.get(0)?,
        ticket_id: row.get(1)?,
        developer_id: row.get(2)?,
        reported_by: row.get(3)?,
        title: row.get(4)?,
        description: row.get(5)?,
        severity: BugSeverity::from_str(&severity_str).unwrap_or(BugSeverity::Medium),
        bug_type: BugType::from_str(&bug_type_str).unwrap_or(BugType::DeveloperError),
        is_resolved: row.get(8)?,
        resolved_date: row.get(9)?,
        resolved_by_developer_id: row.get(10)?,
        fix_ticket_id: row.get(11)?,
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

/// Get a bug by ID (internal helper)
fn get_bug_by_id_internal(conn: &rusqlite::Connection, id: &str) -> Result<Bug, String> {
    conn.query_row(
        "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                severity, bug_type, is_resolved, resolved_date, 
                resolved_by_developer_id, fix_ticket_id, created_at, updated_at
         FROM bugs
         WHERE id = ?1",
        [id],
        |row| parse_bug_row(row),
    )
    .map_err(|e| format!("Bug not found: {}", e))
}

/// Create a new bug
#[tauri::command]
pub fn create_bug(state: State<DbState>, input: CreateBugInput) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Validate severity and bug_type
    let severity = BugSeverity::from_str(&input.severity)?;
    let bug_type = BugType::from_str(&input.bug_type)?;

    // Verify ticket exists and get developer_id from ticket
    // This developer_id is the one who introduced the bug (KPI impact applies here)
    let developer_id: String = conn
        .query_row(
            "SELECT developer_id FROM tickets WHERE id = ?1",
            [&input.ticket_id],
            |row| row.get(0),
        )
        .map_err(|_| "Ticket not found".to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO bugs (id, ticket_id, developer_id, reported_by, title, description, severity, bug_type, is_resolved, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            &id,
            &input.ticket_id,
            &developer_id,
            &input.reported_by,
            &input.title,
            &input.description,
            severity.as_str(),
            bug_type.as_str(),
            false,
            &now,
            &now,
        ),
    )
    .map_err(|e| format!("Failed to create bug: {}", e))?;

    Ok(Bug {
        id,
        ticket_id: input.ticket_id,
        developer_id,
        reported_by: input.reported_by,
        title: input.title,
        description: input.description,
        severity,
        bug_type,
        is_resolved: false,
        resolved_date: None,
        resolved_by_developer_id: None,
        fix_ticket_id: None,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Get all bugs
#[tauri::command]
pub fn get_all_bugs(state: State<DbState>) -> Result<Vec<Bug>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date,
                    resolved_by_developer_id, fix_ticket_id, created_at, updated_at
             FROM bugs
             ORDER BY created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let bugs = stmt
        .query_map([], |row| parse_bug_row(row))
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    Ok(bugs)
}

/// Get all bugs for a ticket
#[tauri::command]
pub fn get_bugs_by_ticket(
    state: State<DbState>,
    ticket_id: String,
) -> Result<Vec<Bug>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date,
                    resolved_by_developer_id, fix_ticket_id, created_at, updated_at
             FROM bugs
             WHERE ticket_id = ?1
             ORDER BY created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let bugs = stmt
        .query_map([&ticket_id], |row| parse_bug_row(row))
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    Ok(bugs)
}

/// Get all bugs for a developer (bugs they introduced - affects their KPI)
#[tauri::command]
pub fn get_bugs_by_developer(
    state: State<DbState>,
    developer_id: String,
) -> Result<Vec<Bug>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, ticket_id, developer_id, reported_by, title, description, 
                    severity, bug_type, is_resolved, resolved_date,
                    resolved_by_developer_id, fix_ticket_id, created_at, updated_at
             FROM bugs
             WHERE developer_id = ?1
             ORDER BY created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let bugs = stmt
        .query_map([&developer_id], |row| parse_bug_row(row))
        .map_err(|e| format!("Failed to query bugs: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect bugs: {}", e))?;

    Ok(bugs)
}

/// Update a bug
#[tauri::command]
pub fn update_bug(state: State<DbState>, input: UpdateBugInput) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current bug
    let current = get_bug_by_id_internal(&conn, &input.id)?;

    // Apply updates
    let title = input.title.unwrap_or(current.title);
    let description = input.description.or(current.description);
    let severity = match input.severity {
        Some(s) => BugSeverity::from_str(&s)?,
        None => current.severity,
    };
    let bug_type = match input.bug_type {
        Some(bt) => BugType::from_str(&bt)?,
        None => current.bug_type,
    };
    let is_resolved = input.is_resolved.unwrap_or(current.is_resolved);
    let now = Utc::now().to_rfc3339();

    // If resolving, set resolved_date
    let resolved_date = if is_resolved && !current.is_resolved {
        Some(Utc::now().format("%Y-%m-%d").to_string())
    } else if !is_resolved {
        None
    } else {
        current.resolved_date
    };

    // Handle resolved_by_developer_id
    let resolved_by_developer_id = if is_resolved && !current.is_resolved {
        // If newly resolving, use provided resolver or keep None
        input.resolved_by_developer_id.or(current.resolved_by_developer_id)
    } else if !is_resolved {
        // If unresolving, clear the resolver
        None
    } else {
        // Keep existing or update with new value
        input.resolved_by_developer_id.or(current.resolved_by_developer_id)
    };

    // Handle fix_ticket_id
    let fix_ticket_id = input.fix_ticket_id.or(current.fix_ticket_id);

    conn.execute(
        "UPDATE bugs
         SET title = ?1, description = ?2, severity = ?3, bug_type = ?4, 
             is_resolved = ?5, resolved_date = ?6, resolved_by_developer_id = ?7, 
             fix_ticket_id = ?8, updated_at = ?9
         WHERE id = ?10",
        (
            &title,
            &description,
            severity.as_str(),
            bug_type.as_str(),
            is_resolved,
            &resolved_date,
            &resolved_by_developer_id,
            &fix_ticket_id,
            &now,
            &input.id,
        ),
    )
    .map_err(|e| format!("Failed to update bug: {}", e))?;

    Ok(Bug {
        id: input.id,
        ticket_id: current.ticket_id,
        developer_id: current.developer_id,
        reported_by: current.reported_by,
        title,
        description,
        severity,
        bug_type,
        is_resolved,
        resolved_date,
        resolved_by_developer_id,
        fix_ticket_id,
        created_at: current.created_at,
        updated_at: now,
    })
}

/// Resolve a bug with optional resolver info
/// If fix_ticket_id is provided along with resolved_by_developer_id,
/// the fix ticket will be reassigned to the resolver and hours will be added
#[tauri::command]
pub fn resolve_bug(
    state: State<DbState>, 
    id: String,
    resolved_by_developer_id: Option<String>,
    fix_ticket_id: Option<String>,
    fix_hours: Option<f64>,
    resolved_date: Option<String>,
) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current bug
    let current = get_bug_by_id_internal(&conn, &id)?;

    if current.is_resolved {
        return Err("Bug is already resolved".to_string());
    }

    let now = Utc::now().to_rfc3339();
    // Use provided resolved_date or default to today
    let resolved_date_str = if let Some(date_str) = resolved_date {
        // Normalize to DATETIME format
        if date_str.contains('T') {
            let parts: Vec<&str> = date_str.split('T').collect();
            if parts.len() == 2 {
                let time_part = if parts[1].len() == 5 {
                    format!("{}:00", parts[1])
                } else if parts[1].len() >= 8 {
                    parts[1][..8].to_string()
                } else {
                    format!("{}:00:00", parts[1])
                };
                format!("{} {}", parts[0], time_part)
            } else {
                Utc::now().format("%Y-%m-%d %H:%M:%S").to_string()
            }
        } else {
            format!("{} 00:00:00", date_str)
        }
    } else {
        Utc::now().format("%Y-%m-%d %H:%M:%S").to_string()
    };

    // If we have a fix ticket, complete it and optionally reassign to resolver
    if let Some(ref ticket_id) = fix_ticket_id {
        // Get current actual_hours from the ticket
        let current_hours: Option<f64> = conn
            .query_row(
                "SELECT actual_hours FROM tickets WHERE id = ?1",
                [ticket_id],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to get ticket hours: {}", e))?;

        // Calculate new total hours (accumulate)
        let new_hours = if let Some(add_hours) = fix_hours {
            Some(current_hours.unwrap_or(0.0) + add_hours)
        } else {
            current_hours
        };

        // If we have a resolver, reassign the ticket to them
        // Also mark the ticket as completed with resolved date
        if let Some(ref resolver_id) = resolved_by_developer_id {
            conn.execute(
                "UPDATE tickets SET developer_id = ?1, actual_hours = ?2, status = 'completed', completed_date = ?3, updated_at = ?4 WHERE id = ?5",
                (resolver_id, new_hours, &resolved_date_str, &now, ticket_id),
            )
            .map_err(|e| format!("Failed to complete fix ticket: {}", e))?;
        } else {
            // No resolver specified, just complete the ticket with hours
            conn.execute(
                "UPDATE tickets SET actual_hours = ?1, status = 'completed', completed_date = ?2, updated_at = ?3 WHERE id = ?4",
                (new_hours, &resolved_date_str, &now, ticket_id),
            )
            .map_err(|e| format!("Failed to complete fix ticket: {}", e))?;
        }
    }

    // Update the bug as resolved
    conn.execute(
        "UPDATE bugs SET is_resolved = TRUE, resolved_date = ?1, 
         resolved_by_developer_id = ?2, fix_ticket_id = ?3, updated_at = ?4 
         WHERE id = ?5",
        (&resolved_date_str, &resolved_by_developer_id, &fix_ticket_id, &now, &id),
    )
    .map_err(|e| format!("Failed to resolve bug: {}", e))?;

    Ok(Bug {
        id,
        ticket_id: current.ticket_id,
        developer_id: current.developer_id,
        reported_by: current.reported_by,
        title: current.title,
        description: current.description,
        severity: current.severity,
        bug_type: current.bug_type,
        is_resolved: true,
        resolved_date: Some(resolved_date_str),
        resolved_by_developer_id,
        fix_ticket_id,
        created_at: current.created_at,
        updated_at: now,
    })
}

/// Update resolution date/time for a bug (triggers KPI recalculation)
#[tauri::command]
pub fn update_resolution_date(
    state: State<DbState>,
    id: String,
    resolved_date: String,
) -> Result<Bug, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;

    // Get current bug
    let current = get_bug_by_id_internal(&conn, &id)?;

    if !current.is_resolved {
        return Err("Bug must be resolved before updating resolution date".to_string());
    }

    let now = Utc::now().to_rfc3339();
    // Normalize to DATETIME format
    let resolved_date_str = if resolved_date.contains('T') {
        let parts: Vec<&str> = resolved_date.split('T').collect();
        if parts.len() == 2 {
            let time_part = if parts[1].len() == 5 {
                format!("{}:00", parts[1])
            } else if parts[1].len() >= 8 {
                parts[1][..8].to_string()
            } else {
                format!("{}:00:00", parts[1])
            };
            format!("{} {}", parts[0], time_part)
        } else {
            return Err("Invalid date format".to_string());
        }
    } else {
        format!("{} 00:00:00", resolved_date)
    };

    conn.execute(
        "UPDATE bugs SET resolved_date = ?1, updated_at = ?2 WHERE id = ?3",
        (&resolved_date_str, &now, &id),
    )
    .map_err(|e| format!("Failed to update resolution date: {}", e))?;

    get_bug_by_id_internal(&conn, &id)
}
