mod commands;
mod config;
mod db;
mod models;
mod services;

use commands::*;
use db::DbState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize database
    let db_state = DbState::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            // Developer commands
            is_first_time_setup,
            create_developer,
            get_all_developers,
            get_developer_by_id,
            update_developer,
            delete_developer,
            // Ticket commands
            create_ticket,
            get_all_tickets,
            get_tickets_by_developer,
            update_ticket,
            update_ticket_status,
            complete_ticket,
            reopen_ticket,
            update_completion_date,
            update_due_date,
            update_reopen_count,
            // Bug commands
            create_bug,
            get_all_bugs,
            get_bugs_by_ticket,
            get_bugs_by_developer,
            update_bug,
            resolve_bug,
            update_resolution_date,
            // KPI/Report commands
            generate_monthly_kpi,
            get_kpi_history,
            get_current_month_kpi,
            export_monthly_kpi_csv,
            // Config commands
            get_kpi_config,
            save_kpi_config_command,
            // Data management commands
            export_all_data,
            import_data,
            clear_all_data,
            backup_database,
            restore_database,
            restart_app,
            // Utility commands
            open_url,
            // Updater commands
            get_app_version,
            check_for_updates,
            update_app_version,
            backup_before_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
