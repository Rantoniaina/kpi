# KPI Tool v0.2.0 - Release Build Guide

## Pre-Release Checklist

- [x] Update version numbers to 0.2.0
- [x] Update CHANGELOG.md
- [x] Update public/CHANGELOG.md
- [x] Create release notes (RELEASE_NOTES_0.2.0.md)
- [x] Verify frontend builds (`npm run build`)
- [x] Verify Rust code compiles (`cargo check`)
- [ ] Build release binaries
- [ ] Test release binaries
- [ ] Create GitHub release
- [ ] Upload release artifacts

## Build Instructions

### Build for macOS

```bash
# Build for current platform (Apple Silicon or Intel)
npm run tauri build

# Build outputs:
# - DMG: src-tauri/target/release/bundle/dmg/KPI Tool_0.2.0_*.dmg
# - App Bundle: src-tauri/target/release/bundle/macos/KPI Tool.app
```

### Build for Linux

```bash
# Build AppImage
npm run tauri build -- --target x86_64-unknown-linux-gnu

# Build outputs:
# - AppImage: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/kpi-tool_0.2.0_*.AppImage
# - Debian: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/kpi-tool_0.2.0_*.deb
```

### Build for Windows

```bash
# Build MSI installer
npm run tauri build -- --target x86_64-pc-windows-msvc

# Build outputs:
# - MSI: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/KPI Tool_0.2.0_*.msi
# - EXE: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/KPI Tool_0.2.0_*.exe
```

## GitHub Release Steps

1. **Create Release Tag**:
   ```bash
   git tag -a v0.2.0 -m "Release version 0.2.0"
   git push origin v0.2.0
   ```

2. **Create GitHub Release**:
   - Go to https://github.com/Rantoniaina/kpi/releases/new
   - Select tag: `v0.2.0`
   - Title: `KPI Tool v0.2.0`
   - Description: Copy from `RELEASE_NOTES_0.2.0.md`

3. **Upload Release Artifacts**:
   - Upload DMG file for macOS
   - Upload AppImage or .deb for Linux
   - Upload MSI for Windows

4. **Publish Release**: Click "Publish release"

## Testing Checklist

Before releasing, test:

- [ ] App launches successfully
- [ ] Database migrations run automatically
- [ ] Version displays correctly (0.2.0)
- [ ] Auto-update check works (should find 0.2.0 if testing with 0.1.0)
- [ ] Changelog viewer works
- [ ] Bug reporting works
- [ ] Date/time pickers work correctly
- [ ] Ticket/bug editing works
- [ ] KPI recalculation works after edits
- [ ] Data backup/restore works
- [ ] Export/import works

## Post-Release

- [ ] Update README.md if needed
- [ ] Announce release (if applicable)
- [ ] Monitor for issues

## Version 0.2.0 Highlights

- ✨ Auto-update system with GitHub Releases integration
- ✨ Enhanced date/time pickers with month/year navigation
- ✨ DateTimePicker for precise timestamp selection
- ✨ Ticket/bug editing enhancements (completion date, due date, reopen count, resolution date)
- ✨ Changelog viewer accessible from Settings and sidebar
- ✨ GitHub issue reporting integration
- 🔧 Improved date input validation
- 🐛 Fixed date input validation bug
- 🐛 Fixed database migration handling

