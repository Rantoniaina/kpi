# KPI Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A standalone desktop application for tracking developer performance through ticket management, bug tracking, and monthly KPI reporting.

## 🚧 Development Status

**Phase 12 Complete** - All core features and enhancements complete. The application includes auto-update system, enhanced date/time handling, and comprehensive UI improvements. Ready for release with standalone builds for macOS, Linux, and Windows.

### Completed

- ✅ Tauri + React + TypeScript project initialized
- ✅ Tailwind CSS + shadcn/ui configured
- ✅ SQLite database with migrations
- ✅ Rust backend structure (commands, models, services)
- ✅ Developer CRUD operations (create, read, update, soft-delete)
- ✅ Ticket CRUD operations (create, status updates, complete, reopen)
- ✅ Bug CRUD operations (create, resolve, reclassify, auto-link to developer)
- ✅ React hooks for all entities (useDevelopers, useTickets, useBugs, useKPI)
- ✅ App shell with sidebar navigation and routing
- ✅ Common UI components (DataTable, StatCard, StatusBadge, EmptyState, etc.)
- ✅ Form components with validation (react-hook-form + zod)
- ✅ Developer list page with search/filter
- ✅ Developer form dialog (create & edit modes)
- ✅ Developer detail card with summary stats and quick actions
- ✅ Ticket list page with search, filter by status/developer, sorting
- ✅ Ticket form dialog (create & edit modes)
- ✅ Ticket detail card with status workflow buttons
- ✅ Mark Complete action (with accumulating actual hours)
- ✅ Reopen action (increments counter, affects KPI)
- ✅ Visual ticket timeline showing lifecycle stages
- ✅ Bug list page with comprehensive filtering
- ✅ Bug form dialog with visual bug type selector
- ✅ Bug detail card with classification display
- ✅ Bug resolve action with resolver selection and fix ticket linking
- ✅ Bug reclassify action with KPI impact visualization
- ✅ Auto-complete fix ticket when bug is resolved
- ✅ KPI Calculator Service (delivery, quality, overall scores)
- ✅ Monthly KPI generation and storage
- ✅ Real-time KPI preview (current month)
- ✅ Dashboard with team KPI summary and averages
- ✅ Reports page with month/year/developer selectors
- ✅ Monthly report component with charts (ticket breakdown, bug breakdown, trend)
- ✅ Developer KPI deep-dive view with historical performance
- ✅ Export functionality (CSV and PDF/HTML export)
- ✅ Chart library integration (recharts) with custom chart components
- ✅ Enhanced Dashboard with widget-based grid layout
- ✅ Dashboard widgets (active developers, on-time rate, quality score, overdue alerts)
- ✅ Monthly trend mini-chart showing team performance over time
- ✅ Quick action buttons (Add Ticket, Report Bug) with inline dialogs
- ✅ Recent activity feed with developer names and dates
- ✅ Settings page with organized sections
- ✅ KPI Configuration (delivery/quality weights, bug severity penalties)
- ✅ Data Management (backup, restore, export, import, clear)
- ✅ Error Handling (error boundaries, toast notifications, database error recovery)
- ✅ Loading States (skeleton loaders, loading indicators, disabled buttons during operations)
- ✅ Edge Cases (empty states, first-time setup welcome screen, corrupted database handling)
- ✅ Performance Optimizations (pagination, lazy loading, database query optimization)
- ✅ App Metadata (version, bundle identifier, icons)
- ✅ macOS Build (DMG installer created)
- ✅ Release Documentation (release notes and distribution guide)
- ✅ Date/Time Handling Improvements (DateTimePicker, historical dates, enhanced date picker)
- ✅ Ticket/Bug Completion & Editing (completion date, due date, reopen count, resolution date editing)
- ✅ Settings & UI Improvements (changelog viewer, bug reporting, removed app preferences)
- ✅ Auto-Update System (GitHub Releases API, automatic version checking, update notifications)

### Status

**✅ Ready for Release** - Version 0.1.0 is complete with all core features, enhancements, and auto-update system. Ready for distribution. See [RELEASE_NOTES.md](RELEASE_NOTES.md) for details.

## Features

- **Developer Management** - Track your team members with roles (junior, mid, senior, lead)
- **Ticket Tracking** - Assign tickets with due dates, track on-time delivery and reopens
- **Bug Classification** - Categorize bugs fairly (developer error vs conceptual vs external)
- **Bug Resolution Workflow** - Track who fixed bugs and link to fix tickets
- **KPI Calculation** - Automatic calculation of delivery, quality, and overall scores
- **Real-time Dashboard** - View team performance metrics and averages
- **Monthly KPI Reports** - Generate and store monthly performance snapshots with detailed charts
- **Trend Analysis** - Track improvement or decline over time with visual trend charts
- **Export Reports** - Export KPI reports as CSV or HTML (for PDF printing)
- **Developer KPI Deep-Dive** - Individual developer performance analysis with historical trends
- **Error Handling** - Comprehensive error boundaries and user-friendly error messages
- **Loading States** - Skeleton loaders and loading indicators for better UX
- **Performance** - Pagination, lazy loading, and optimized database queries
- **First-Time Setup** - Welcome screen for new users with onboarding guidance
- **Enhanced Date/Time Pickers** - Month/year navigation, time selection, historical date support
- **Auto-Update System** - Automatic version checking and update notifications via GitHub Releases
- **Changelog Viewer** - View version history and release notes directly in the app
- **Bug Reporting** - One-click GitHub issue creation with pre-filled templates

## Bug Tracking & KPI

### How Bugs Affect KPI

| Bug Type               | KPI Impact      | Description                       |
| ---------------------- | --------------- | --------------------------------- |
| **Developer Error**    | Full deduction  | Coding mistake or oversight       |
| **Conceptual**         | Minor deduction | Requirement misunderstanding      |
| **Requirement Change** | No deduction    | Spec changed after implementation |
| **Environment**        | No deduction    | Infrastructure issue              |
| **Third-Party**        | No deduction    | External dependency problem       |

### Bug Resolution Flow

When resolving a bug, you can:

1. **Select who fixed it** - Different from who introduced it
2. **Link a fix ticket** - The ticket created to fix this bug
3. **Log hours spent** - Time tracking for KPI

The system automatically:

- Keeps KPI impact on the developer who **introduced** the bug
- Reassigns the fix ticket to the **resolver**
- Marks the fix ticket as **completed**
- Adds logged hours to the fix ticket

## Tech Stack

| Component | Technology                 |
| --------- | -------------------------- |
| Framework | Tauri 2.x                  |
| Frontend  | React 19 + TypeScript      |
| Styling   | Tailwind CSS 4 + shadcn/ui |
| Database  | SQLite (rusqlite)          |
| Backend   | Rust                       |

## Installation

### For Users

#### macOS
1. Download the `.dmg` file from [Releases](releases)
2. Open the DMG file
3. Drag "KPI Tool" to your Applications folder
4. Launch from Applications

#### Ubuntu/Linux
1. Download the `.AppImage` or `.deb` file from [Releases](releases)
2. **For AppImage**: Make it executable and run:
   ```bash
   chmod +x kpi-tool_*.AppImage
   ./kpi-tool_*.AppImage
   ```
3. **For .deb package**: Install with:
   ```bash
   sudo dpkg -i kpi-tool_*.deb
   sudo apt-get install -f  # Fix dependencies if needed
   ```

#### Windows
1. Download the `.msi` installer from [Releases](releases)
2. Run the installer
3. Launch from Start Menu or Desktop shortcut

### For Developers

#### Prerequisites

**All Platforms:**
- Node.js 18+
- Rust (latest stable) - Install from [rustup.rs](https://rustup.rs/)

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Windows:**
- Microsoft Visual Studio C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

#### Build Instructions

```bash
# Clone the repository
git clone https://github.com/yourusername/kpi-tool.git
cd kpi-tool

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production (current platform)
npm run tauri build

# Build for specific platform
npm run tauri build -- --target x86_64-unknown-linux-gnu  # Linux
npm run tauri build -- --target x86_64-pc-windows-msvc    # Windows
npm run tauri build -- --target aarch64-apple-darwin      # macOS ARM64
npm run tauri build -- --target x86_64-apple-darwin       # macOS Intel
```

#### Build Outputs

**macOS:**
- DMG: `src-tauri/target/release/bundle/dmg/KPI Tool_0.1.0_*.dmg`
- App Bundle: `src-tauri/target/release/bundle/macos/KPI Tool.app`

**Ubuntu/Linux:**
- AppImage: `src-tauri/target/release/bundle/appimage/kpi-tool_0.1.0_*.AppImage`
- Debian: `src-tauri/target/release/bundle/deb/kpi-tool_0.1.0_*.deb`

**Windows:**
- MSI: `src-tauri/target/release/bundle/msi/KPI Tool_0.1.0_*.msi`
- EXE: `src-tauri/target/release/bundle/nsis/KPI Tool_0.1.0_*.exe`

## Project Structure

```
kpi/
├── src/                      # React frontend
│   ├── components/
│   │   ├── ui/               # shadcn/ui + custom components
│   │   ├── layout/           # MainLayout, Sidebar, Header
│   │   ├── developers/       # DeveloperFormDialog, DeveloperCard
│   │   ├── tickets/          # TicketFormDialog, TicketCard, TicketTimeline
│   │   ├── bugs/             # BugFormDialog, BugCard
│   │   └── reports/          # MonthlyReport, DeveloperKPI, ExportButton
│   ├── pages/                # Dashboard, Developers, Tickets, Bugs, Reports
│   ├── hooks/                # useDevelopers, useTickets, useBugs, useKPI
│   ├── types/                # TypeScript interfaces
│   └── lib/                  # Utilities & Tauri wrappers
├── src-tauri/src/            # Rust backend
│   ├── commands/             # Tauri IPC commands
│   ├── db/                   # Database & migrations
│   ├── models/               # Data structures
│   └── services/             # Business logic (KPI calculator)
├── ARCHITECTURE.md           # Technical design
└── DEVELOPMENT_ROADMAP.md    # Build guide
```

## Documentation

- [Architecture](ARCHITECTURE.md) - Technical design and data models
- [Development Roadmap](DEVELOPMENT_ROADMAP.md) - Step-by-step build guide
- [Release Notes](RELEASE_NOTES.md) - Version 0.1.0 release information
- [Release Guide](RELEASE.md) - Distribution and release instructions
- [Changelog](CHANGELOG.md) - Version history and release notes
- [Contributing](CONTRIBUTING.md) - Guidelines for contributing to the project

## How KPI is Calculated

### Delivery Score (0-100)

Based on on-time ticket completion:

- **Base**: (on-time tickets / completed tickets) × 100
- **Bonus**: +5 points per early delivery (>1 day early)
- **Penalty**: -10 points per late critical ticket
- **Penalty**: -5 points per reopened ticket

### Quality Score (0-100)

Starts at 100, with deductions based on bugs:

- **Developer Error** bugs: -15 (critical), -10 (high), -5 (medium), -2 (low) per bug
- **Conceptual** bugs: -3 per bug
- **Requirement Change / Environment / Third-Party** bugs: No deduction

### Overall Score

Weighted average of Delivery and Quality scores (configurable in Settings, default: 50/50 split).

### Trend Calculation

Compares current month's overall score with previous 3 months average:

- **Improving**: current > average + 5
- **Stable**: within ±5 of average
- **Declining**: current < average - 5

## Dashboard

The Dashboard provides real-time insights with a comprehensive widget-based layout:

### Primary Metrics

- **Active Developers**: Current count of active team members
- **Open Tickets**: Tickets currently in progress
- **Completed Tickets**: Total completed tickets
- **Average Score**: Team-wide overall KPI average

### Current Month Metrics

- **On-Time Rate**: Average on-time completion rate for the current month
- **Quality Score**: Average quality score for the current month
- **Overdue Tickets Alert**: Visual warning when tickets are past due date

### Performance Tracking

- **Monthly Trend Chart**: Team average overall score over the last 6 months
- **Team KPI Summary**: Individual developer scores with delivery, quality, and overall metrics
- **Recent Activity Feed**: Latest completed tickets and reported bugs with developer names

### Quick Actions

- **Add Ticket**: Create new tickets directly from the dashboard
- **Report Bug**: Report bugs without leaving the dashboard
- **Navigation Links**: Quick access to Developers, Tickets, Bugs, and Reports pages

## Reports & Export

### Monthly Reports

Generate detailed KPI reports for any developer or the entire team:

- **Summary Cards**: Delivery, Quality, and Overall scores
- **Ticket Breakdown**: Bar chart showing completed, on-time, late, and reopened tickets
- **Bug Breakdown**: Pie chart showing bug types (Developer Error, Conceptual, Other)
- **Performance Trend**: Line chart showing score progression over the last 6 months
- **Detailed Metrics**: Comprehensive breakdown of all ticket and bug metrics

### Developer KPI Deep-Dive

View individual developer performance:

- **Average Scores**: Historical averages across all months
- **Latest Month**: Current month performance snapshot
- **Trend Chart**: Visual representation of performance over time
- **Monthly Breakdown Table**: Detailed metrics for each month

### Export Options

- **CSV Export**: Download KPI data as a CSV file for analysis in Excel or other tools
- **PDF Export**: Save reports as HTML files that can be opened in a browser and printed to PDF
- **Native File Dialogs**: Uses system file dialogs for seamless file saving

## Settings & Configuration

### KPI Configuration

Customize how KPI scores are calculated:

- **Score Weights**: Adjust the balance between delivery and quality scores (must sum to 100%)
- **Bug Severity Penalties**: Configure point deductions for each bug severity level
  - Critical: Default 15 points
  - High: Default 10 points
  - Medium: Default 5 points
  - Low: Default 2 points
- **Auto-Save**: Configuration is automatically saved to `config.json`

### Data Management

Comprehensive data management tools:

- **Export All Data (JSON)**: Export all developers, tickets, bugs, and KPI reports to a JSON file
- **Import Data (JSON)**: Import data from a JSON file (automatically reloads the app)
- **Backup Database**: Create timestamped backups of the SQLite database
- **Restore Database**: Restore from a backup file (automatically reloads the app)
- **Clear All Data**: Permanently delete all data with confirmation dialog

### About & Updates

- **Version Information**: View current app version (clickable to view changelog)
- **Changelog Viewer**: View version history and release notes in a dialog
- **Report Bug**: One-click GitHub issue creation with pre-filled bug report template
- **Auto-Update**: Automatic version checking on app startup with update notifications

## Error Handling & User Experience

### Error Boundaries

The application includes React error boundaries to catch and display errors gracefully:

- **UI Error Recovery**: Errors in components are caught and displayed with helpful messages
- **Database Error Detection**: Automatic detection of database corruption with restore options
- **User-Friendly Messages**: Clear error messages with actionable recovery steps

### Loading States

Enhanced user experience with comprehensive loading indicators:

- **Skeleton Loaders**: Table and card skeleton loaders while data is loading
- **Loading Spinners**: Visual feedback during data fetches and operations
- **Disabled States**: Buttons are automatically disabled during operations to prevent duplicate actions

### Edge Cases

Robust handling of edge cases:

- **Empty States**: Helpful empty state messages with action buttons when no data exists
- **First-Time Setup**: Welcome screen with onboarding guidance for new users
- **Database Corruption**: Automatic detection with options to restore from backup or start fresh
- **Error Recovery**: Clear error messages with recovery paths for common issues

## Performance

### Optimizations

The application is optimized for performance:

- **Pagination**: Large lists automatically paginate (25 items per page by default, configurable)
- **Lazy Loading**: Routes are code-split and loaded on demand, reducing initial bundle size
- **Database Indexes**: Optimized database queries with proper indexes on frequently queried columns
- **Memoization**: React hooks use memoization to prevent unnecessary re-renders

### Database Performance

- **Indexed Queries**: All common query patterns use indexed columns
- **Prepared Statements**: All database queries use prepared statements for security and performance
- **Efficient Aggregations**: KPI calculations use optimized SQL aggregations

## Data Storage

Your data is stored locally at:

**macOS:**
```
~/Library/Application Support/kpi-tool/
├── kpi.db          # SQLite database
├── config.json     # KPI configuration (weights, bug penalties)
└── backups/        # Database backups (manual + automatic pre-update backups)
```

**Ubuntu/Linux:**
```
~/.local/share/kpi-tool/
├── kpi.db          # SQLite database
├── config.json     # KPI configuration (weights, bug penalties)
└── backups/        # Database backups (manual + automatic pre-update backups)
```

**Windows:**
```
%APPDATA%\kpi-tool\
├── kpi.db          # SQLite database
├── config.json     # KPI configuration (weights, bug penalties)
└── backups/        # Database backups (manual + automatic pre-update backups)
```

### Automatic Backups

The app automatically creates backups before updates:
- **Pre-Update Backups**: Created automatically when downloading a new version
- **Manual Backups**: Created via Settings → Data Management → Backup Database
- **Backup Naming**: `kpi_pre_update_YYYYMMDD_HHMMSS.db` (automatic) or `kpi_backup_YYYYMMDD_HHMMSS.db` (manual)

## Auto-Update System

KPI Tool includes an automatic update system that checks for new versions on startup:

### How It Works

1. **Automatic Checking**: On app startup, the app checks GitHub Releases API for new versions
2. **Update Notification**: If a new version is available, a notification dialog appears with:
   - New version number
   - Release notes
   - Download button
3. **Automatic Backup**: Before downloading, the app automatically creates a database backup
4. **Platform Detection**: Automatically finds the correct installer for your platform (`.dmg`, `.AppImage`, `.deb`, `.msi`)
5. **Database Migrations**: After updating, database migrations run automatically to ensure compatibility

### Update Process

1. App detects new version → Shows update notification
2. User clicks "Download Update" → Automatic backup created
3. Download page opens in browser → User downloads and installs
4. App restarts → Migrations run automatically
5. Database version updated → App ready to use

### Manual Update Check

Updates are checked automatically on startup. To check manually, restart the app.

## Release Information

**Current Version**: 0.2.0  
**Supported Platforms**: macOS, Ubuntu/Linux, Windows  
**Build Date**: December 2024

### Download

Pre-built binaries are available for:
- **macOS**: `.dmg` installer (Apple Silicon and Intel)
- **Ubuntu/Linux**: `.AppImage` (portable) or `.deb` (system package)
- **Windows**: `.msi` installer

Download from [GitHub Releases](https://github.com/Rantoniaina/kpi/releases) or build from source using the instructions above.

**Note**: When you create a GitHub release with a new version tag, users will be automatically notified on the next app startup.

See [RELEASE_NOTES.md](RELEASE_NOTES.md) for detailed release information and [RELEASE.md](RELEASE.md) for distribution instructions.

### Building for Multiple Platforms

To build for all platforms, you'll need to:

1. **Build on each platform** (recommended):
   - macOS: Build on macOS
   - Linux: Build on Ubuntu/Linux
   - Windows: Build on Windows

2. **Or use CI/CD** (GitHub Actions):
   - Set up workflows to build on each platform automatically
   - See Tauri documentation for GitHub Actions examples

3. **Cross-compilation** (advanced):
   - Possible but complex due to system library dependencies
   - Requires setting up cross-compilation toolchains

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 KPI Tool
