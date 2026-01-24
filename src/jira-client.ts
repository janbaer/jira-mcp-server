import type {
  JiraConfig,
  CreateIssueInput,
  CreateIssueResponse,
  JiraErrorResponse,
  AtlassianDocumentFormat,
} from "./types.js";

/**
 * Client for interacting with the Jira REST API
 */
export class JiraClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly defaultProject: string;

  constructor(config: JiraConfig) {
    // Ensure URL doesn't have trailing slash
    this.baseUrl = config.jiraUrl.replace(/\/$/, "");

    // Create Basic Auth header (email:api_token base64 encoded)
    const credentials = `${config.jiraEmail}:${config.jiraApiToken}`;
    const encoded = Buffer.from(credentials).toString("base64");
    this.authHeader = `Basic ${encoded}`;

    this.defaultProject = config.jiraProject;
  }

  /**
   * Convert plain text description to Atlassian Document Format (ADF)
   * Simple conversion: splits on double newlines to create paragraphs
   */
  private toADF(text: string): AtlassianDocumentFormat {
    // Split text into paragraphs
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

    return {
      type: "doc",
      version: 1,
      content: paragraphs.map((paragraph) => ({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: paragraph.trim(),
          },
        ],
      })),
    };
  }

  /**
   * Create a new Jira issue
   */
  async createIssue(input: CreateIssueInput): Promise<CreateIssueResponse> {
    const projectKey = input.projectKey || this.defaultProject;

    // Build the request body
    const body: Record<string, unknown> = {
      fields: {
        project: {
          key: projectKey,
        },
        summary: input.summary,
        issuetype: {
          name: input.issueType || "Task",
        },
      },
    };

    // Add optional description in ADF format
    if (input.description) {
      // If description is already an ADF object, use it directly
      // Otherwise, convert plain text to ADF
      (body.fields as Record<string, unknown>).description =
        typeof input.description === "string"
          ? this.toADF(input.description)
          : input.description;
    }

    // Add optional priority
    if (input.priority) {
      (body.fields as Record<string, unknown>).priority = {
        name: input.priority,
      };
    }

    // Add optional labels
    if (input.labels && input.labels.length > 0) {
      (body.fields as Record<string, unknown>).labels = input.labels;
    }

    // Make the API request
    const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    // Handle errors
    if (!response.ok) {
      let errorMessage = `Jira API error: ${response.status} ${response.statusText}`;

      try {
        const errorBody = (await response.json()) as JiraErrorResponse;
        if (errorBody.errorMessages && errorBody.errorMessages.length > 0) {
          errorMessage += ` - ${errorBody.errorMessages.join(", ")}`;
        }
        if (errorBody.errors) {
          const fieldErrors = Object.entries(errorBody.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          if (fieldErrors) {
            errorMessage += ` - Field errors: ${fieldErrors}`;
          }
        }
      } catch {
        // Could not parse error response
      }

      throw new Error(errorMessage);
    }

    const result = (await response.json()) as CreateIssueResponse;

    // Add the browsable URL to the response
    result.self = `${this.baseUrl}/browse/${result.key}`;

    return result;
  }

  /**
   * Test the connection to Jira
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/myself`, {
        method: "GET",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
