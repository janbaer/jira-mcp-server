import type { JiraConfig } from "./types";

export function getConfig(): JiraConfig {
  const jiraUrl = process.env.JIRA_URL;
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  const jiraProject = process.env.JIRA_PROJECT;

  const missing: string[] = [];

  if (!jiraUrl) missing.push("JIRA_URL");
  if (!jiraEmail) missing.push("JIRA_EMAIL");
  if (!jiraApiToken) missing.push("JIRA_API_TOKEN");
  if (!jiraProject) missing.push("JIRA_PROJECT");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n\n` +
        "Please set the following environment variables:\n" +
        "  JIRA_URL        - Your Jira instance URL (e.g., https://your-domain.atlassian.net)\n" +
        "  JIRA_EMAIL      - Your Jira account email\n" +
        "  JIRA_API_TOKEN  - Your Jira API token\n" +
        "  JIRA_PROJECT    - Default project key (e.g., PROJ)"
    );
  }

  return {
    jiraUrl: jiraUrl!,
    jiraEmail: jiraEmail!,
    jiraApiToken: jiraApiToken!,
    jiraProject: jiraProject!,
  };
}
