# Branch Protection Rules Setup Guide

This document explains how to configure branch protection rules for the KPI Tool repository.

## Recommended Branch Protection Rules

### For `develop` Branch (Default Branch)

**Settings Location**: GitHub → Settings → Branches → Add rule

**Rule Name**: `develop`

**Branch name pattern**: `develop`

**Protection Settings**:

1. ✅ **Require a pull request before merging**

   - ✅ Require approvals: **1**
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners (if you have a CODEOWNERS file)

2. ✅ **Require status checks to pass before merging**

   - ✅ Require branches to be up to date before merging
   - Add status checks (if you set up CI/CD):
     - `cargo check` (Rust compilation)
     - `npm run build` (TypeScript compilation)

3. ✅ **Require conversation resolution before merging**

   - All PR comments must be resolved

4. ✅ **Require signed commits** (optional but recommended)

   - Ensures commits are verified

5. ✅ **Require linear history** (optional)

   - Prevents merge commits, keeps history clean

6. ❌ **Do not allow bypassing the above settings**

   - Even admins must follow these rules

7. ❌ **Do not allow force pushes**

   - Prevents rewriting history

8. ❌ **Do not allow deletions**
   - Protects the branch from accidental deletion

### For `main`/`master` Branch (Release Branch)

**Rule Name**: `main` or `master`

**Branch name pattern**: `main` (or `master`)

**Protection Settings**:

1. ✅ **Require a pull request before merging**

   - ✅ Require approvals: **2** (stricter for releases)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners

2. ✅ **Require status checks to pass before merging**

   - ✅ Require branches to be up to date before merging
   - All CI/CD checks must pass

3. ✅ **Require conversation resolution before merging**

4. ✅ **Require signed commits**

5. ✅ **Require linear history**

6. ❌ **Do not allow bypassing the above settings**

7. ❌ **Do not allow force pushes**

8. ❌ **Do not allow deletions**

9. ✅ **Restrict who can push to matching branches**
   - Only maintainers/admins

## Step-by-Step Setup Instructions

1. **Go to GitHub Repository Settings**:

   - Navigate to: `https://github.com/Rantoniaina/kpi-tool/settings/branches`

2. **Add Branch Protection Rule for `develop`**:

   - Click "Add rule"
   - Branch name pattern: `develop`
   - Configure settings as above
   - Click "Create"

3. **Add Branch Protection Rule for `main`** (if you use main for releases):

   - Click "Add rule"
   - Branch name pattern: `main`
   - Configure stricter settings as above
   - Click "Create"

4. **Set Default Branch** (if not already set):
   - Go to Settings → General → Default branch
   - Set to `develop`

## Optional: CODEOWNERS File

The `.github/CODEOWNERS` file is already created and requires reviews from `@Rantoniaina` for all code changes.

## Workflow

1. **Development**: Work happens on `develop` branch
2. **Feature Branches**: Created from `develop`
3. **Pull Requests**: Target `develop`, require review
4. **Releases**: Merge `develop` → `main` when ready for release
5. **Hotfixes**: Can be merged directly to `main` if urgent (with proper approval)

## Benefits

- ✅ Prevents accidental pushes to protected branches
- ✅ Ensures code quality through required reviews
- ✅ Maintains clean git history
- ✅ Protects production-ready code
- ✅ Enforces testing before merging
