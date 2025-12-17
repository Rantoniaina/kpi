# KPI Tool - Development Roadmap

A step-by-step guide to building the KPI Tool from scratch.

---

## Phase 0: Project Setup

**Estimated Time: 1-2 hours**

### 0.1 Initialize Tauri Project

- [x] Install prerequisites (Node.js 18+, Rust, Xcode CLI tools)
- [x] Create new Tauri project: `npm create tauri-app@latest kpi-tool`
- [x] Select React + TypeScript template
- [x] Verify setup with `npm run tauri dev`

### 0.2 Configure Frontend Tooling

- [x] Install Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Set up path aliases in `tsconfig.json`
- [x] Create base folder structure (`components/`, `pages/`, `hooks/`, `types/`, `lib/`)

### 0.3 Configure Rust Backend

- [x] Add SQLite dependencies to `Cargo.toml` (rusqlite or sqlx)
- [x] Add serde for JSON serialization
- [x] Add uuid for ID generation
- [x] Create base folder structure (`commands/`, `db/`, `models/`, `services/`)

### 0.4 Database Setup

- [x] Create database initialization function
- [x] Set up migrations system
- [x] Configure app data directory (`~/Library/Application Support/kpi-tool/`)
- [x] Write initial migration (create all tables)

**Deliverable:** Empty app launches, database file created on first run

---

## Phase 1: Core Data Layer

**Estimated Time: 3-4 hours**

### 1.1 Developer Model & CRUD

- [x] Create `Developer` struct in Rust
- [x] Implement `create_developer` command
- [x] Implement `get_all_developers` command
- [x] Implement `get_developer_by_id` command
- [x] Implement `update_developer` command
- [x] Implement `delete_developer` (soft delete - set `is_active = false`)
- [x] Create TypeScript types matching Rust structs
- [x] Create `useDevelopers` hook with Tauri invoke wrappers

### 1.2 Ticket Model & CRUD

- [x] Create `Ticket` struct in Rust
- [x] Implement `create_ticket` command
- [x] Implement `get_all_tickets` command
- [x] Implement `get_tickets_by_developer` command
- [x] Implement `update_ticket` command
- [x] Implement `update_ticket_status` command
- [x] Implement `reopen_ticket` command (increment reopen_count)
- [x] Implement `complete_ticket` command (auto-calculate wasOnTime)
- [x] Create TypeScript types
- [x] Create `useTickets` hook

### 1.3 Bug Model & CRUD

- [x] Create `Bug` struct in Rust
- [x] Implement `create_bug` command (auto-link to ticket's developer)
- [x] Implement `get_bugs_by_ticket` command
- [x] Implement `get_bugs_by_developer` command
- [x] Implement `update_bug` command
- [x] Implement `resolve_bug` command
- [x] Create TypeScript types
- [x] Create `useBugs` hook

**Deliverable:** All CRUD operations working via Tauri commands

---

## Phase 2: UI Foundation

**Estimated Time: 4-5 hours**

### 2.1 Layout Components

- [x] Create `MainLayout` component (sidebar + content area)
- [x] Create `Sidebar` component with navigation
- [x] Create `Header` component
- [x] Set up React Router for page navigation
- [x] Configure light mode only (dark mode removed)

### 2.2 Common UI Components

- [x] Set up shadcn/ui base components (Button, Input, Select, Dialog, etc.)
- [x] Create `DataTable` component for lists
- [x] Create `StatCard` component for metrics display
- [x] Create `StatusBadge` component (for ticket/bug status)
- [x] Create `EmptyState` component
- [x] Create `LoadingSpinner` component
- [x] Create `ConfirmDialog` component

### 2.3 Form Components

- [x] Create reusable `FormField` wrapper
- [x] Create `DatePicker` component
- [x] Create `SelectField` component (for dropdowns)
- [x] Set up form validation (react-hook-form + zod)

**Deliverable:** App shell with navigation, consistent styling

---

## Phase 3: Developer Management

**Estimated Time: 3-4 hours**

### 3.1 Developer List Page

- [x] Create `Developers` page
- [x] Display developers in a table/grid
- [x] Show key info: name, email, role, team, status
- [x] Add search/filter functionality
- [x] Add "Add Developer" button

### 3.2 Developer Form

- [x] Create `DeveloperForm` component
- [x] Fields: name, email, role (dropdown), team, start date
- [x] Validation: required fields, email format
- [x] Handle create mode
- [x] Handle edit mode

### 3.3 Developer Detail/Card

- [x] Create `DeveloperCard` component
- [x] Show developer summary stats
- [x] Quick actions: edit, deactivate
- [x] Link to full developer report

**Deliverable:** Full developer CRUD in UI ✅

---

## Phase 4: Ticket Management

**Estimated Time: 5-6 hours**

### 4.1 Ticket List Page

- [x] Create `Tickets` page
- [x] Display tickets in table view
- [x] Show: title, developer, due date, status, complexity
- [x] Color-code overdue tickets
- [x] Filter by: status, developer, date range
- [x] Sort by: due date, assigned date, status

### 4.2 Ticket Form

- [x] Create `TicketForm` component
- [x] Fields: title, description, developer (dropdown), due date, complexity, estimated hours
- [x] Auto-set assigned date to today
- [x] Validation: required fields, due date >= today

### 4.3 Ticket Card & Actions

- [x] Create `TicketCard` component for detail view
- [x] Show full ticket info + history
- [x] Status change buttons (workflow)
- [x] "Mark Complete" action (calculates on-time)
- [x] "Reopen" action (increments counter)
- [x] Show linked bugs

### 4.4 Ticket Timeline (Optional)

- [x] Create `TicketTimeline` component
- [x] Visual timeline of ticket lifecycle
- [x] Show status changes with timestamps

**Deliverable:** Full ticket management workflow ✅

---

## Phase 5: Bug Tracking

**Estimated Time: 3-4 hours**

### 5.1 Bug List

- [x] Create `Bugs` page (or section within Tickets)
- [x] Display bugs in table
- [x] Show: title, ticket, developer, severity, type, status
- [x] Filter by: bug type, severity, resolved status

### 5.2 Bug Form

- [x] Create `BugForm` component
- [x] Fields: title, description, ticket (dropdown), severity, bug type
- [x] Auto-fill developer from selected ticket
- [x] **Bug Type Selection** - make this prominent with descriptions:
  - Developer Error
  - Conceptual/Requirement Misunderstanding
  - Requirement Change
  - Environment Issue
  - Third-Party Issue

### 5.3 Bug Classification UI

- [x] Create `BugCard` component with detail view
- [x] Visual guide for choosing bug type (reclassify dialog)
- [x] Help text explaining each type
- [x] Impact on KPI shown
- [x] Resolve action with confirmation
- [x] Reclassify bug type action

**Deliverable:** Complete bug tracking with classification

---

## Phase 6: KPI Calculation Engine

**Estimated Time: 4-5 hours**

### 6.1 KPI Calculator Service (Rust)

- [x] Create `kpi_calculator.rs` service
- [x] Implement `calculate_delivery_score`:
  - Base: (on_time / completed) \* 100
  - Bonus for early deliveries (+5 per early delivery)
  - Penalty for late critical tickets (-10 per ticket)
  - Penalty for reopened tickets (-5 per ticket)
- [x] Implement `calculate_quality_score`:
  - Start at 100
  - Deduct based on developer_error bugs (by severity: -15/-10/-5/-2)
  - Minor deduction for conceptual bugs (-3 per bug)
  - No deduction for other types
- [x] Implement `calculate_overall_score`:
  - Weighted average (configurable, default 50/50)
- [x] Implement `calculate_trend`:
  - Compare with 3-month average (±5 threshold)
- [x] Unit tests for all functions (13 tests passing)

### 6.2 Monthly KPI Generation

- [x] Implement `generate_monthly_kpi` command
- [x] Aggregate all metrics for a developer/month:
  - Ticket metrics: total, completed, on-time, late, early, reopened
  - Bug metrics: total, developer_error (by severity), conceptual, other
- [x] Store in `monthly_kpi` table (upsert - update if exists)
- [x] Implement `get_kpi_history` command (returns all months for developer)

### 6.3 Real-time KPI Preview

- [x] Implement `get_current_month_kpi` command
- [x] Calculate on-the-fly (not stored) - uses temporary preview ID
- [x] Used for dashboard display
- [x] Frontend `useKPI` hook with:
  - `currentKPI` - real-time preview for current month
  - `history` - all historical KPI records
  - `generateKPI(month, year)` - generate and store KPI for a specific month

**Deliverable:** Working KPI calculation engine

---

## Phase 7: Reports & Visualization

**Estimated Time: 5-6 hours**

### 7.1 Install Chart Library

- [x] Install recharts library
- [x] Create chart wrapper components:
  - `TrendChart` - Line chart for KPI trends over time
  - `BugPieChart` - Pie chart for bug type breakdown
  - `TicketBarChart` - Bar chart for ticket metrics

### 7.2 Monthly Report Page

- [x] Create `Reports` page
- [x] Month/Year selector (dropdowns with current month/year default)
- [x] Developer selector (dropdown with "All" option)
- [x] Generate report button (calls `generateMonthlyKPI`)
- [x] Display generated/stored KPI data
- [x] Show summary cards (delivery, quality, overall scores)
- [x] Show trend indicator

### 7.3 Report Components

- [x] Create `MonthlyReport` component
- [x] Summary cards: delivery score, quality score, overall (in Reports page)
- [x] Ticket breakdown (completed, on-time, late, reopened) - Bar chart
- [x] Bug breakdown by type (pie chart) - Shows developer errors, conceptual, other
- [x] Trend chart component (line chart over months) - Shows last 6 months
- [x] Additional metrics cards (delivery metrics, quality metrics)
- [x] Integrated into Reports page

### 7.4 Developer KPI View

- [x] Create `DeveloperKPI` component
- [x] Individual developer deep-dive:
  - Average scores (delivery, quality, overall)
  - Latest month performance metrics
  - Performance insights and recommendations
- [x] Historical performance graph (trend chart over last 12 months)
- [x] Monthly breakdown table (last 12 months with detailed metrics)
- [x] Integrated into DeveloperCard with tabbed view (Overview / KPI Report)
- [ ] Comparison with team average (can be added later)

### 7.5 Export Functionality

- [x] Create `ExportButton` component
- [x] Export to CSV (implement in Rust)
- [x] Export to PDF (use browser print or pdf library)

**Deliverable:** Visual reports with charts and export

---

## Phase 8: Dashboard

**Estimated Time: 3-4 hours**

### 8.1 Dashboard Layout

- [x] Create `Dashboard` page
- [x] Design grid layout for widgets

### 8.2 Dashboard Widgets

- [x] Active developers count
- [x] Current month on-time rate
- [x] Current month quality score
- [x] Overdue tickets alert (with count)
- [x] Recent activity feed
- [x] Monthly trend mini-chart

### 8.3 Quick Actions

- [x] "Add Ticket" quick button
- [x] "Report Bug" quick button
- [x] Links to detailed views

**Deliverable:** Informative dashboard homepage

---

## Phase 9: Settings & Configuration

**Estimated Time: 2-3 hours**

### 9.1 Settings Page

- [x] Create `Settings` page
- [x] Organize into sections

### 9.2 KPI Configuration

- [x] Delivery score weight slider
- [x] Quality score weight slider
- [x] Bug severity penalties (editable)
- [x] Save to config file

### 9.3 Data Management

- [x] Manual backup button
- [x] Restore from backup
- [x] Export all data (JSON)
- [x] Import data (JSON)
- [x] Clear all data (with confirmation)

### 9.4 App Preferences

- [x] Light mode only (theme toggle removed)

**Deliverable:** Configurable app settings

---

## Phase 10: Polish & Testing

**Estimated Time: 3-4 hours**

### 10.1 Error Handling

- [x] Add error boundaries in React
- [x] Toast notifications for success/error
- [x] Graceful handling of database errors
- [x] Validation error messages

### 10.2 Loading States

- [x] Add loading indicators to all data fetches
- [x] Skeleton loaders for lists
- [x] Disable buttons during operations

### 10.3 Edge Cases

- [x] Handle empty states (no developers, no tickets)
- [x] Handle first-time setup
- [x] Handle corrupted database (offer restore)

### 10.4 Performance

- [x] Add pagination to large lists
- [x] Optimize database queries
- [x] Lazy load pages

**Deliverable:** Polished, error-free application

---

## Phase 11: Build & Distribution

**Estimated Time: 2-3 hours**

### 11.1 App Metadata

- [x] Set app name, version in `tauri.conf.json`
- [x] Create app icon (multiple sizes)
- [x] Set bundle identifier

### 11.2 macOS Build

- [x] Run `npm run tauri build`
- [x] Test `.dmg` installer
- [x] Test app in Applications folder
- [x] Verify database location

### 11.3 Code Signing (Optional)

- [ ] Obtain Apple Developer ID
- [ ] Sign the application
- [ ] Notarize with Apple

### 11.4 Release

- [x] Create GitHub release
- [x] Upload `.dmg` artifact
- [x] Write release notes
- [x] Update version to 0.2.0
- [x] Update CHANGELOG.md for 0.2.0

**Deliverable:** Distributable macOS application

---

## Phase 12: Enhancements & Improvements

**Estimated Time: 6-8 hours**

### 12.1 Date/Time Handling Improvements

- [x] Fix date input validation bug (due date shows value but validation fails on create)
- [x] Enhance DatePicker component with month/year navigation for rapid date selection
- [x] Add time input support for assigned date and due date (currently only dates, but calculations use time)
- [x] Update database schema to use DATETIME instead of DATE for assigned_date, due_date, completed_date
- [x] Create DateTimePicker component (date + time selection)
- [x] Allow past due dates when creating tickets (for historical data entry)
- [x] Update validation to allow historical dates when appropriate

### 12.2 Ticket/Bug Completion & Editing Enhancements

- [x] Add date/time picker when marking ticket as completed
- [x] Add date/time picker when marking bug as resolved
- [x] Implement `update_completion_date` command for tickets (with KPI recalculation trigger)
- [x] Implement `update_resolution_date` command for bugs (with KPI recalculation trigger)
- [x] Add UI to edit completion date/time in ticket detail view
- [x] Add UI to edit resolution date/time in bug detail view
- [x] Implement `update_reopen_count` command for tickets
- [x] Add UI to manually edit reopen count in ticket detail view
- [x] Implement `update_due_date` command for tickets (with KPI recalculation trigger)
- [x] Add UI to update due date in ticket detail view
- [x] Ensure KPI recalculation runs automatically when dates/counts change

### 12.3 Settings & UI Improvements

- [x] Remove "App Preferences" section from Settings page (no options currently)
- [x] Create `ChangelogDialog` component to display version changelog
- [x] Add click handler to version number in Settings "About" section
- [x] Create `CHANGELOG.md` file with version history
- [x] Implement changelog parsing and display in dialog
- [x] Add "Report Bug" button in Settings page
- [x] Implement GitHub issue creation (open browser to GitHub issue creation page with pre-filled template)
- [x] Add GitHub repository URL to config/constants

### 12.4 Auto-Update System

- [x] Research Tauri auto-updater capabilities
- [x] Set up update server/endpoint (GitHub Releases API or custom server)
- [x] Implement version checking on app startup
- [x] Create update notification UI component
- [x] Implement update download and installation flow
- [x] Ensure database migrations run automatically on update
- [ ] Test update from 0.1.0 to 0.2.0 without data loss
- [x] Add version migration logic to handle schema changes
- [x] Create backup before update (safety measure)

**Deliverable:** Enhanced date/time handling, improved ticket/bug editing, cleaner settings, changelog viewer, bug reporting, and auto-update system

---

## Summary Timeline

| Phase     | Description                 | Est. Time        |
| --------- | --------------------------- | ---------------- |
| 0         | Project Setup               | 1-2 hours        |
| 1         | Core Data Layer             | 3-4 hours        |
| 2         | UI Foundation               | 4-5 hours        |
| 3         | Developer Management        | 3-4 hours        |
| 4         | Ticket Management           | 5-6 hours        |
| 5         | Bug Tracking                | 3-4 hours        |
| 6         | KPI Calculation             | 4-5 hours        |
| 7         | Reports & Visualization     | 5-6 hours        |
| 8         | Dashboard                   | 3-4 hours        |
| 9         | Settings                    | 2-3 hours        |
| 10        | Polish & Testing            | 3-4 hours        |
| 11        | Build & Distribution        | 2-3 hours        |
| 12        | Enhancements & Improvements | 6-8 hours        |
| **Total** |                             | **~46-58 hours** |

---

## Recommended Development Order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                                    ↓
                              Phase 8 ← Phase 7 ← Phase 6
                                ↓
                            Phase 9 → Phase 10 → Phase 11 → Phase 12
```

### MVP (Minimum Viable Product)

To get a working app quickly, prioritize:

1. Phase 0 (Setup)
2. Phase 1 (Data Layer)
3. Phase 2 (UI Foundation)
4. Phase 3 (Developers)
5. Phase 4 (Tickets)
6. Phase 6 (KPI Calculation - basic)
7. Phase 11 (Build)

This gives you a functional app in ~20-25 hours.

---

## Notes

- Each checkbox can be treated as a commit point
- Test after each phase before moving on
- Keep the UI simple initially, enhance later
- Database migrations should be backward compatible
- Back up your database before testing destructive operations
