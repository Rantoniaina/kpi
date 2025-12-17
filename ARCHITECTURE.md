# KPI Tool - Architecture Document

## Overview

A standalone desktop application for tracking developer performance through ticket management, bug tracking, and monthly KPI reporting.

---

## Tech Stack

### Application Framework: **Tauri**

- **Why Tauri?**
  - Native macOS support (primary requirement)
  - Cross-platform capability (Windows, Linux) for future
  - Lightweight (~10MB vs Electron's ~150MB+)
  - No need for external hosting or environment setup
  - Single executable distribution
  - Built-in auto-updater

### Frontend: **React + TypeScript**

- Modern UI development
- Strong typing for data models
- Rich ecosystem for charts/visualizations

### UI Framework: **Tailwind CSS + shadcn/ui**

- Rapid UI development
- Consistent design system
- Dark/Light mode support

### Backend (Rust): **Tauri Core**

- File system access for local database
- Native OS integrations
- High performance

### Database: **SQLite**

- **Why SQLite?**
  - Zero configuration
  - Single file database (portable)
  - No server needed
  - Embedded in the application
  - Backup = copy one file

### ORM: **SQLx** (Rust) or **Prisma** (if using sidecar)

- Type-safe database queries
- Migration support

---

## Application Structure

```
kpi-tool/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   ├── commands/             # Tauri commands (API)
│   │   │   ├── mod.rs
│   │   │   ├── developers.rs     # Developer CRUD
│   │   │   ├── tickets.rs        # Ticket management
│   │   │   ├── bugs.rs           # Bug tracking
│   │   │   └── reports.rs        # KPI calculations
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── schema.rs         # Database schema
│   │   │   └── migrations/       # SQL migrations
│   │   ├── models/               # Data structures
│   │   │   ├── mod.rs
│   │   │   ├── developer.rs
│   │   │   ├── ticket.rs
│   │   │   ├── bug.rs
│   │   │   └── kpi.rs
│   │   └── services/             # Business logic
│   │       ├── mod.rs
│   │       ├── kpi_calculator.rs # KPI algorithms
│   │       └── report_generator.rs
│   ├── Cargo.toml
│   └── tauri.conf.json           # Tauri configuration
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── developers/
│   │   │   ├── DeveloperList.tsx
│   │   │   ├── DeveloperForm.tsx
│   │   │   └── DeveloperCard.tsx
│   │   ├── tickets/
│   │   │   ├── TicketBoard.tsx
│   │   │   ├── TicketForm.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   └── TicketTimeline.tsx
│   │   ├── bugs/
│   │   │   ├── BugList.tsx
│   │   │   ├── BugForm.tsx
│   │   │   └── BugClassification.tsx
│   │   ├── reports/
│   │   │   ├── MonthlyReport.tsx
│   │   │   ├── DeveloperKPI.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   └── ExportButton.tsx
│   │   └── ui/                   # shadcn components
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Developers.tsx
│   │   ├── Tickets.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   │
│   ├── hooks/
│   │   ├── useDevelopers.ts
│   │   ├── useTickets.ts
│   │   ├── useBugs.ts
│   │   └── useKPI.ts
│   │
│   ├── lib/
│   │   ├── tauri.ts              # Tauri invoke wrappers
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── developer.ts
│   │   ├── ticket.ts
│   │   ├── bug.ts
│   │   └── kpi.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Data Models

### Developer

```typescript
interface Developer {
  id: string;
  name: string;
  email: string;
  role: 'junior' | 'mid' | 'senior' | 'lead';
  team?: string;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Ticket

```typescript
interface Ticket {
  id: string;
  title: string;
  description?: string;
  developerId: string;

  // Timing (all include time for precise calculations)
  assignedDate: Date; // Includes time
  dueDate: Date; // Includes time (critical for on-time calculation)
  completedDate?: Date; // Includes time (critical for delivery metrics)

  // Status
  status: 'assigned' | 'in_progress' | 'review' | 'completed' | 'reopened';

  // Metrics
  estimatedHours?: number;
  actualHours?: number;
  complexity: 'low' | 'medium' | 'high' | 'critical';

  // Tracking
  wasOnTime: boolean; // Calculated: completedDate <= dueDate (time-aware comparison)
  reopenCount: number; // How many times ticket was reopened (editable)

  createdAt: Date;
  updatedAt: Date;
}
```

### Bug

```typescript
interface Bug {
  id: string;
  ticketId: string; // Related ticket
  developerId: string; // Developer who worked on the ticket
  reportedBy?: string;

  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Classification (KEY for KPI)
  bugType:
    | 'developer_error'
    | 'conceptual'
    | 'requirement_change'
    | 'environment'
    | 'third_party';

  // developer_error: Bug caused by developer's code
  // conceptual: Misunderstanding of requirements/specs
  // requirement_change: Requirements changed after implementation
  // environment: Environment/configuration issues
  // third_party: External dependency issues

  isResolved: boolean;
  resolvedDate?: Date; // Includes time for resolution tracking

  createdAt: Date;
  updatedAt: Date;
}
```

### KPI Report

```typescript
interface MonthlyKPI {
  developerId: string;
  month: number; // 1-12
  year: number;

  // Ticket Metrics
  totalTickets: number;
  completedTickets: number;
  onTimeTickets: number;
  lateTickets: number;
  reopenedTickets: number;

  // Time Metrics
  onTimeRate: number; // % of tickets completed on time
  avgDeliveryTime: number; // Average days to complete

  // Bug Metrics
  totalBugs: number;
  developerErrorBugs: number; // Bugs attributed to developer
  conceptualBugs: number; // Not developer's fault
  otherBugs: number;

  // Calculated Scores
  deliveryScore: number; // 0-100 based on on-time delivery
  qualityScore: number; // 0-100 based on bug rate
  overallScore: number; // Weighted average

  // Trend
  trend: 'improving' | 'stable' | 'declining';

  generatedAt: Date;
}
```

---

## Database Schema (SQLite)

```sql
-- Developers table
CREATE TABLE developers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('junior', 'mid', 'senior', 'lead')) NOT NULL,
    team TEXT,
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
-- Note: assigned_date, due_date, and completed_date use DATETIME to support time precision
-- This is important for accurate delivery calculations (on-time vs late)
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    developer_id TEXT NOT NULL,
    assigned_date DATETIME NOT NULL,  -- Changed from DATE to DATETIME
    due_date DATETIME NOT NULL,        -- Changed from DATE to DATETIME
    completed_date DATETIME,           -- Changed from DATE to DATETIME
    status TEXT CHECK(status IN ('assigned', 'in_progress', 'review', 'completed', 'reopened')) NOT NULL,
    estimated_hours REAL,
    actual_hours REAL,
    complexity TEXT CHECK(complexity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    reopen_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Bugs table
-- Note: resolved_date uses DATETIME for consistency and time tracking
CREATE TABLE bugs (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    developer_id TEXT NOT NULL,
    reported_by TEXT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    bug_type TEXT CHECK(bug_type IN ('developer_error', 'conceptual', 'requirement_change', 'environment', 'third_party')) NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATETIME,            -- Changed from DATE to DATETIME
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Monthly KPI snapshots (cached calculations)
CREATE TABLE monthly_kpi (
    id TEXT PRIMARY KEY,
    developer_id TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_tickets INTEGER DEFAULT 0,
    completed_tickets INTEGER DEFAULT 0,
    on_time_tickets INTEGER DEFAULT 0,
    late_tickets INTEGER DEFAULT 0,
    reopened_tickets INTEGER DEFAULT 0,
    on_time_rate REAL DEFAULT 0,
    avg_delivery_time REAL DEFAULT 0,
    total_bugs INTEGER DEFAULT 0,
    developer_error_bugs INTEGER DEFAULT 0,
    conceptual_bugs INTEGER DEFAULT 0,
    other_bugs INTEGER DEFAULT 0,
    delivery_score REAL DEFAULT 0,
    quality_score REAL DEFAULT 0,
    overall_score REAL DEFAULT 0,
    trend TEXT CHECK(trend IN ('improving', 'stable', 'declining')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(developer_id, month, year),
    FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Indexes for performance
CREATE INDEX idx_tickets_developer ON tickets(developer_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_dates ON tickets(assigned_date, due_date, completed_date);
CREATE INDEX idx_bugs_ticket ON bugs(ticket_id);
CREATE INDEX idx_bugs_developer ON bugs(developer_id);
CREATE INDEX idx_bugs_type ON bugs(bug_type);
CREATE INDEX idx_kpi_developer_period ON monthly_kpi(developer_id, year, month);
```

---

## KPI Calculation Logic

### Delivery Score (0-100)

```
deliveryScore = (onTimeTickets / completedTickets) * 100

Adjustments:
- Bonus: +5 for each early delivery (> 1 day early)
- Penalty: -10 for each critical ticket late
- Penalty: -5 for each reopened ticket
```

### Quality Score (0-100)

```
Base = 100

Deductions:
- developer_error bugs: -15 per bug (critical), -10 (high), -5 (medium), -2 (low)
- conceptual bugs: -3 per bug (not developer's fault, but affects metrics slightly)
- Other bug types: No deduction

Minimum score: 0
```

### Overall Score

```
overallScore = (deliveryScore * 0.5) + (qualityScore * 0.5)

// Weights can be configured in settings
```

### Trend Calculation

```
Compare current month's overallScore with previous 3 months average:
- Improving: current > avg + 5
- Declining: current < avg - 5
- Stable: otherwise
```

---

## Key Features

### 1. Dashboard

- Overview of all active developers
- Current month's ticket status
- Quick stats (on-time rate, bug rate)
- Alerts for overdue tickets

### 2. Developer Management

- Add/Edit/Deactivate developers
- View individual developer history
- Compare developers side-by-side

### 3. Ticket Management

- Create and assign tickets
- Set due dates and complexity
- Track status changes
- Mark as completed (auto-calculate on-time)
- Reopen tickets (increment counter)

### 4. Bug Tracking

- Link bugs to tickets
- Classify bug type (crucial for fair KPI)
- Track resolution

### 5. Monthly Reports

- Auto-generate at month end
- Historical comparison
- Export to PDF/CSV
- Visual charts and graphs

### 6. Settings

- Configure KPI weights
- Set working days (exclude weekends/holidays)
- Backup/Restore database
- Import/Export data
- View changelog (click version number)
- Report bug (opens GitHub issue creation)

---

## UI Wireframe Concept

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 KPI Tool                              [Settings] [Profile]  │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  📊 Dashboard│   DASHBOARD                                      │
│              │   ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  👥 Developers│   │ Active  │ │ On-Time │ │ Quality │           │
│              │   │   12    │ │  87%    │ │  92%    │           │
│  🎫 Tickets  │   └─────────┘ └─────────┘ └─────────┘           │
│              │                                                  │
│  🐛 Bugs     │   Recent Activity                                │
│              │   ┌────────────────────────────────────────┐     │
│  📈 Reports  │   │ • John completed TKT-123 (on time)     │     │
│              │   │ • Bug reported on TKT-119              │     │
│  ⚙️ Settings │   │ • Sarah assigned TKT-125               │     │
│              │   └────────────────────────────────────────┘     │
│              │                                                  │
│              │   Monthly Trend Chart                            │
│              │   ┌────────────────────────────────────────┐     │
│              │   │    📈 [Chart visualization here]       │     │
│              │   └────────────────────────────────────────┘     │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## Distribution

### macOS

- `.dmg` installer
- Drag to Applications folder
- Code signing with Apple Developer ID (optional but recommended)
- Notarization for Gatekeeper (optional)

### Future Platforms

- Windows: `.msi` or `.exe` installer
- Linux: `.AppImage` or `.deb`

---

## Data Storage Location

```
macOS: ~/Library/Application Support/kpi-tool/
├── kpi.db              # SQLite database
├── config.json         # User preferences
└── backups/            # Auto-backups
    ├── kpi_2024_01.db
    └── kpi_2024_02.db
```

---

## Changelog & Version Management

### Changelog File

- **Location**: `CHANGELOG.md` in project root
- **Format**: Markdown with version sections
- **Display**: Clicking version number in Settings opens `ChangelogDialog`
- **Content**: Version history, new features, bug fixes, breaking changes

### Version Display

- Version shown in Settings "About" section
- Clickable to open changelog dialog
- Format: `v0.1.0` (semantic versioning)

---

## Bug Reporting Integration

### GitHub Issue Creation

- **Button Location**: Settings page
- **Action**: Opens browser to GitHub issue creation page
- **Pre-filled Template**: Includes app version, OS, and issue type
- **Repository**: Configurable in app constants/config

### Issue Template Fields

- App version
- Operating system
- Description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (user can attach)

---

## Development Setup

```bash
# Prerequisites
- Node.js 18+
- Rust (latest stable)
- Xcode Command Line Tools (macOS)

# Install
npm install

# Development
npm run tauri dev

# Build for production
npm run tauri build
```

---

## Date/Time Handling

### Database Storage

All date/time fields use `DATETIME` type in SQLite to support time precision:

- **assigned_date**: When ticket was assigned (includes time)
- **due_date**: When ticket is due (includes time for accurate on-time calculation)
- **completed_date**: When ticket was completed (includes time for accurate delivery metrics)
- **resolved_date**: When bug was resolved (includes time)

### Date/Time Input Components

- **DatePicker**: Enhanced with month/year navigation for rapid date selection
- **DateTimePicker**: Combined date + time picker for precise timestamp selection
- **Historical Data**: Allows past due dates when creating tickets for historical data entry

### KPI Recalculation Triggers

The following operations trigger automatic KPI recalculation:

1. **Update completion date/time** - Recalculates `wasOnTime` and delivery score
2. **Update due date** - Recalculates `wasOnTime` for all affected tickets
3. **Update reopen count** - Recalculates delivery score (reopen penalty)
4. **Update resolution date/time** - May affect quality score if bug type changes
5. **Mark ticket as completed** - Full recalculation of delivery metrics
6. **Mark bug as resolved** - May affect quality score

**Implementation Note**: When dates/counts are updated, affected monthly KPIs should be invalidated and regenerated on next report generation.

---

## Auto-Update System

### Architecture

The application uses Tauri's built-in auto-updater for seamless version updates:

1. **Version Checking**: On app startup, check for updates via:

   - GitHub Releases API (for public repos)
   - Custom update server endpoint
   - Update manifest file

2. **Update Flow**:

   ```
   App Start → Check Version → New Version Available?
   ├─ No → Continue normally
   └─ Yes → Show Update Notification → Download Update → Install → Restart
   ```

3. **Data Safety**:

   - Automatic database backup before update
   - Database migrations run automatically on update
   - Rollback mechanism if update fails

4. **Migration Strategy**:
   - Version stored in database: `app_version` table
   - Migration scripts run in order based on version
   - Backward compatibility maintained where possible

### Update Server Configuration

- **GitHub Releases**: Use GitHub Releases API to fetch latest version
- **Update Manifest**: JSON file containing version info and download URLs
- **Platform-Specific**: Different update URLs for macOS, Linux, Windows

### Version Migration

When updating from version X to Y:

1. Backup current database
2. Check `app_version` in database
3. Run migrations for versions between X and Y
4. Update `app_version` to Y
5. Verify database integrity
6. Continue app startup

---

## Future Enhancements (v2+)

1. **Team Management** - Group developers into teams
2. **Sprint Integration** - Map tickets to sprints
3. **Jira/GitHub Import** - Sync tickets from external tools
4. **Custom KPI Formulas** - User-defined scoring
5. **Multi-user** - Share database via cloud sync
6. **Notifications** - Desktop alerts for deadlines
7. **AI Insights** - Predict delays, suggest improvements

---

## Summary

| Component    | Technology         | Reason                          |
| ------------ | ------------------ | ------------------------------- |
| Framework    | Tauri              | Lightweight, native, standalone |
| Frontend     | React + TypeScript | Modern, type-safe               |
| Styling      | Tailwind + shadcn  | Fast, consistent                |
| Database     | SQLite             | Embedded, zero-config           |
| Backend      | Rust               | Performance, security           |
| Distribution | DMG (macOS)        | Native installer                |
