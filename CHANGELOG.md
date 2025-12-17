# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Team management
- Sprint integration
- Custom KPI formulas

---

## [0.2.0] - 2024-12-29

### Added
- Auto-update system with GitHub Releases API integration
- Automatic version checking on app startup
- Update notification dialog with release notes
- Automatic database backup before updates
- App version tracking in database
- Platform-specific update asset detection (macOS, Linux, Windows)
- Changelog viewer accessible from Settings and sidebar footer
- GitHub issue reporting integration with pre-filled bug report template
- Enhanced date/time pickers with month/year navigation
- DateTimePicker component for precise timestamp selection
- Historical data entry support (past due dates allowed)
- Ticket completion with date/time selection
- Bug resolution with date/time selection
- Edit completion date, due date, and reopen count for tickets
- Edit resolution date for bugs
- Automatic KPI recalculation when dates/counts change

### Changed
- Removed "App Preferences" section from Settings (no options currently)
- Improved date input validation and user experience
- Database schema updated to use DATETIME fields for better time precision

### Fixed
- Date input validation bug in ticket creation form
- Database migration handling for missing columns
- Version display consistency across app

---

## [0.1.0] - 2024-12-XX

### Added
- Initial release of KPI Tool
- Developer management (create, edit, delete, view)
- Ticket management with status workflow
- Bug tracking with severity and type classification
- Monthly KPI calculation and reporting
- Dashboard with real-time KPI metrics
- Data export/import functionality
- Database backup and restore
- Settings page for KPI configuration

### Features
- **Developer Management**: Track developer information, roles, and active status
- **Ticket Tracking**: Full lifecycle management from assignment to completion
- **Bug Tracking**: Comprehensive bug tracking with severity levels and type classification
- **KPI Calculation**: Automated monthly KPI scores based on delivery and quality metrics
- **Reports**: Generate and export monthly KPI reports in CSV format
- **Data Management**: Export, import, backup, and restore functionality
- **Cross-platform**: Works on macOS, Linux, and Windows

### Technical Details
- Built with Tauri 2.x (Rust backend + React frontend)
- SQLite database for local data storage
- TypeScript for type safety
- Tailwind CSS + shadcn/ui for modern UI
- Responsive design with dark mode support

[0.1.0]: https://github.com/Rantoniaina/kpi/releases/tag/v0.1.0
[0.2.0]: https://github.com/Rantoniaina/kpi/releases/tag/v0.2.0

