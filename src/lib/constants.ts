/**
 * Application constants and configuration
 */

export const APP_VERSION = "0.2.0";

export const GITHUB_REPOSITORY = {
  owner: "Rantoniaina",
  repo: "kpi",
  url: "https://github.com/Rantoniaina/kpi",
  issuesUrl: "https://github.com/Rantoniaina/kpi/issues/new",
};

/**
 * Get GitHub issue creation URL with pre-filled template
 */
export function getGitHubIssueUrl(): string {
  const params = new URLSearchParams({
    title: "[Bug Report] ",
    body: `## Bug Report

**App Version:** ${APP_VERSION}
**Operating System:** ${navigator.platform}
**Description:**


**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots:**
(If applicable, add screenshots to help explain your problem)

**Additional Context:**
Add any other context about the problem here.
`,
  });

  return `${GITHUB_REPOSITORY.issuesUrl}?${params.toString()}`;
}
