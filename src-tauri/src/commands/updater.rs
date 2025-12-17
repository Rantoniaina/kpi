use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    pub url: String,
    pub release_notes: Option<String>,
    pub published_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubRelease {
    tag_name: String,
    html_url: String,
    body: Option<String>,
    published_at: Option<String>,
    assets: Vec<GitHubAsset>,
}

#[derive(Debug, Serialize, Deserialize)]
struct GitHubAsset {
    name: String,
    browser_download_url: String,
    content_type: Option<String>,
}

/// Get current app version from database
#[tauri::command]
pub fn get_app_version(state: State<DbState>) -> Result<String, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let version: String = conn
        .query_row(
            "SELECT version FROM app_version WHERE id = 1",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to get app version: {}", e))?;
    
    Ok(version)
}

/// Update app version in database (after successful update)
#[tauri::command]
pub fn update_app_version(state: State<DbState>, version: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    conn.execute(
        "UPDATE app_version SET version = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
        [&version],
    )
    .map_err(|e| format!("Failed to update app version: {}", e))?;
    Ok(())
}

/// Check for updates using GitHub Releases API
#[tauri::command]
pub async fn check_for_updates(current_version: String) -> Result<Option<UpdateInfo>, String> {
    const GITHUB_API_URL: &str = "https://api.github.com/repos/Rantoniaina/kpi/releases/latest";
    
    let client = reqwest::Client::new();
    let response = client
        .get(GITHUB_API_URL)
        .header("User-Agent", "KPI-Tool-Updater")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch release info: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("GitHub API returned status: {}", response.status()));
    }
    
    let release: GitHubRelease = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse release info: {}", e))?;
    
    // Extract version from tag (remove 'v' prefix if present)
    let latest_version = release.tag_name.trim_start_matches('v').to_string();
    
    // Compare versions using proper semantic versioning
    // Only return update if latest_version > current_version
    if is_version_newer(&latest_version, &current_version) {
        // Find the appropriate asset for the current platform
        let platform_asset = find_platform_asset(&release.assets);
        
        Ok(Some(UpdateInfo {
            version: latest_version,
            url: platform_asset.unwrap_or_else(|| release.html_url.clone()),
            release_notes: release.body,
            published_at: release.published_at,
        }))
    } else {
        Ok(None)
    }
}

/// Compare semantic versions (e.g., "0.2.0" vs "0.1.0")
/// Returns true if latest_version > current_version
fn is_version_newer(latest: &str, current: &str) -> bool {
    // Parse versions into (major, minor, patch) tuples
    let parse_version = |v: &str| -> Option<(u32, u32, u32)> {
        let parts: Vec<&str> = v.split('.').collect();
        if parts.len() >= 3 {
            let major = parts[0].parse().ok()?;
            let minor = parts[1].parse().ok()?;
            let patch = parts[2].split('-').next()?.parse().ok()?; // Handle pre-release versions
            Some((major, minor, patch))
        } else {
            None
        }
    };
    
    let latest_parts = match parse_version(latest) {
        Some(parts) => parts,
        None => return false, // Invalid version format, don't suggest update
    };
    
    let current_parts = match parse_version(current) {
        Some(parts) => parts,
        None => return true, // Invalid current version, assume update needed
    };
    
    // Compare major, minor, patch in order
    if latest_parts.0 > current_parts.0 {
        return true;
    } else if latest_parts.0 < current_parts.0 {
        return false;
    }
    
    // Major versions are equal, compare minor
    if latest_parts.1 > current_parts.1 {
        return true;
    } else if latest_parts.1 < current_parts.1 {
        return false;
    }
    
    // Major and minor are equal, compare patch
    latest_parts.2 > current_parts.2
}

/// Find the appropriate asset for the current platform
fn find_platform_asset(assets: &[GitHubAsset]) -> Option<String> {
    #[cfg(target_os = "macos")]
    let target_extensions = vec![".dmg", ".app.tar.gz"];
    
    #[cfg(target_os = "linux")]
    let target_extensions = vec![".AppImage", ".deb", ".tar.gz"];
    
    #[cfg(target_os = "windows")]
    let target_extensions = vec![".msi", ".exe"];
    
    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    let target_extensions: Vec<&str> = vec![]; // Unknown platform
    
    for asset in assets {
        for ext in &target_extensions {
            if asset.name.ends_with(ext) {
                return Some(asset.browser_download_url.clone());
            }
        }
    }
    
    None
}

/// Create a backup before updating (safety measure)
#[tauri::command]
pub fn backup_before_update(state: State<DbState>) -> Result<String, String> {
    use crate::db::{get_app_data_dir, get_db_path};
    use std::fs;
    use chrono::Utc;
    
    let db_path = get_db_path();
    if !db_path.exists() {
        return Err("Database file does not exist".to_string());
    }
    
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
    let backup_dir = get_app_data_dir().join("backups");
    
    // Create backups directory if it doesn't exist
    if !backup_dir.exists() {
        fs::create_dir_all(&backup_dir)
            .map_err(|e| format!("Failed to create backups directory: {}", e))?;
    }
    
    let backup_path = backup_dir.join(format!("kpi_pre_update_{}.db", timestamp));
    
    fs::copy(&db_path, &backup_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

