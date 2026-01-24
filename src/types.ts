/**
 * Configuration for the Jira MCP server
 */
export interface JiraConfig {
  /** Base URL of the Jira instance (e.g., https://your-domain.atlassian.net) */
  jiraUrl: string;
  /** Email address of the Jira user */
  jiraEmail: string;
  /** API token for authentication */
  jiraApiToken: string;
  /** Default project key for issue creation */
  jiraProject: string;
}

/**
 * Input parameters for creating a Jira issue
 */
export interface CreateIssueInput {
  /** Summary/title of the issue */
  summary: string;
  /** Description of the issue - either plain text (converted to simple paragraphs) or pre-formatted ADF object */
  description?: string | AtlassianDocumentFormat;
  /** Issue type (e.g., "Task", "Bug", "Story") - defaults to "Task" */
  issueType?: string;
  /** Priority (e.g., "Highest", "High", "Medium", "Low", "Lowest") */
  priority?: string;
  /** Labels to add to the issue */
  labels?: string[];
  /** Override the default project key */
  projectKey?: string;
}

/**
 * Response from creating a Jira issue
 */
export interface CreateIssueResponse {
  /** The issue ID */
  id: string;
  /** The issue key (e.g., "PROJ-123") */
  key: string;
  /** URL to the created issue */
  self: string;
}

/**
 * Jira API error response
 */
export interface JiraErrorResponse {
  errorMessages: string[];
  errors: Record<string, string>;
}

/**
 * Atlassian Document Format (ADF) for descriptions
 * Flexible structure that supports paragraphs, headings, panels, lists, etc.
 */
export interface AtlassianDocumentFormat {
  type: "doc";
  version: 1;
  content: any[]; // Flexible array to support all ADF node types
}
