# Contributing to KPI Tool

Thank you for your interest in contributing to KPI Tool! This document provides guidelines for contributing to the project.

## Branch Strategy

- **`develop`**: Default branch for ongoing development
- **`main`/`master`**: Production-ready releases only
- **Feature branches**: Create from `develop` for new features

## Pull Request Process

### Before Creating a PR

1. **Create a feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Follow coding standards**:
   - Use TypeScript strict mode (no `any` types)
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**:
   ```bash
   npm run tauri dev  # Test in development
   npm run tauri build  # Ensure it builds
   ```

4. **Update relevant documentation**:
   - Update `DEVELOPMENT_ROADMAP.md` if adding features
   - Update `README.md` if changing user-facing features
   - Add/update code comments

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**:
   - Base branch: `develop`
   - Compare branch: `feature/your-feature-name`
   - Fill out the PR template

3. **PR Requirements**:
   - ✅ All checks must pass
   - ✅ At least one review required
   - ✅ No merge conflicts
   - ✅ Descriptive title and description
   - ✅ Link to related issues (if any)

### PR Title Format

Use conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
- `feat: add dark mode support`
- `fix: resolve database corruption detection`
- `docs: update installation instructions`

## Code Review Process

1. **Automated Checks**: All PRs must pass:
   - TypeScript compilation
   - Rust compilation
   - Linting (if configured)

2. **Review Requirements**:
   - At least one approval from maintainers
   - All review comments addressed
   - CI/CD checks passing

3. **After Approval**:
   - Maintainers will merge to `develop`
   - Releases are created from `develop` → `main`

## Commit Guidelines

- Write clear, descriptive commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issues when applicable: `fix: resolve #123`

## Development Setup

See [README.md](README.md) for development setup instructions.

## Questions?

Open an issue or contact the maintainers.

