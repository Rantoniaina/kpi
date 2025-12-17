# KPI Tool v0.2.0 - Release Notes

## 🎉 Version 0.2.0 Release

This release introduces the auto-update system, enhanced date/time handling, improved ticket/bug editing capabilities, and several UI improvements.

## ✨ New Features

### Auto-Update System

- **Automatic Version Checking**: The app automatically checks for updates on startup
- **Update Notifications**: Beautiful dialog showing new version, release notes, and download button
- **Automatic Backups**: Database is automatically backed up before downloading updates
- **Platform Detection**: Automatically finds the correct installer for your platform (macOS, Linux, Windows)
- **GitHub Releases Integration**: Seamlessly integrates with GitHub Releases API

### Enhanced Date/Time Handling

- **Enhanced Date Picker**: Month/year navigation for rapid date selection
- **DateTimePicker Component**: Combined date + time picker for precise timestamp selection
- **Historical Data Entry**: Support for entering past due dates when creating tickets
- **Time Selection**: Added time input to ticket due dates and completion dates
- **Database Schema Update**: Migrated to DATETIME fields for better time precision

### Ticket & Bug Editing Enhancements

- **Edit Completion Date/Time**: Update when a ticket was completed with full date/time control
- **Edit Due Date**: Update ticket due dates with automatic KPI recalculation
- **Edit Reopen Count**: Manually adjust reopen count for tickets
- **Edit Resolution Date/Time**: Update when a bug was resolved with full date/time control
- **Automatic KPI Recalculation**: All date/count changes trigger automatic KPI updates

### UI Improvements

- **Changelog Viewer**: View version history and release notes directly in the app
  - Accessible from Settings page (click version number)
  - Accessible from sidebar footer (click version number)
- **Bug Reporting**: One-click GitHub issue creation with pre-filled bug report template
- **Settings Cleanup**: Removed empty "App Preferences" section
- **Version Display**: Consistent version display across the app

## 🔧 Improvements

- Improved date input validation and user experience
- Better error handling for database migrations
- Enhanced database integrity checks
- More robust version tracking in database

## 🐛 Bug Fixes

- Fixed date input validation bug in ticket creation form
- Fixed database migration handling for missing columns
- Fixed version display consistency across app

## 📦 Installation

### Updating from 0.1.0

1. The app will automatically notify you of the update on startup
2. Click "Download Update" in the notification dialog
3. A backup will be created automatically
4. Download and install the new version
5. Database migrations will run automatically
6. Your data will be preserved

### Fresh Installation

1. Download the appropriate installer for your platform:
   - **macOS**: `KPI Tool_0.2.0_*.dmg`
   - **Linux**: `kpi-tool_0.2.0_*.AppImage` or `.deb`
   - **Windows**: `KPI Tool_0.2.0_*.msi`
2. Install and launch the application
3. Follow the welcome screen for first-time setup

## 📍 Data Storage

Your data is stored locally at:

**macOS:**
```
~/Library/Application Support/kpi-tool/
├── kpi.db          # SQLite database
├── config.json     # KPI configuration
└── backups/        # Manual + automatic pre-update backups
```

**Linux:**
```
~/.local/share/kpi-tool/
├── kpi.db          # SQLite database
├── config.json     # KPI configuration
└── backups/        # Manual + automatic pre-update backups
```

**Windows:**
```
%APPDATA%\kpi-tool\
├── kpi.db          # SQLite database
├── config.json     # KPI configuration
└── backups/        # Manual + automatic pre-update backups
```

## 🔄 Migration Notes

- **Database Migrations**: Run automatically on first launch of 0.2.0
- **Version Tracking**: App version is now tracked in database
- **Backup Safety**: Automatic backup created before update
- **Data Preservation**: All existing data is preserved during update

## 🛠️ Technical Details

- **Framework**: Tauri 2.x
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: SQLite (embedded, local storage)
- **Backend**: Rust
- **Platform**: macOS, Linux, Windows

## 🔮 What's Next

Future enhancements planned:
- Team management and grouping
- Sprint integration
- Custom KPI formulas
- Multi-user support
- Desktop notifications

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Tauri](https://tauri.app/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Chart library

---

**Version**: 0.2.0  
**Release Date**: December 29, 2024  
**Platform**: macOS, Linux, Windows

