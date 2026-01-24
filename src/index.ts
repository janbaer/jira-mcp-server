#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { JiraClient } from "./jira-client.js";
import type { JiraConfig } from "./types.js";

/**
 * Get configuration from environment variables
 */
function getConfig(): JiraConfig {
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

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  // Get configuration
  const config = getConfig();

  // Create Jira client
  const jiraClient = new JiraClient(config);

  // Create the MCP server
  const server = new McpServer({
    name: "jira-mcp-server",
    version: "1.0.0",
  });

  // Register the jira-create-issue tool
  server.tool(
    "jira-create-issue",
    "Create a new issue in Jira. Returns the issue key and URL.",
    {
      summary: z
        .string()
        .min(1)
        .describe("Summary/title of the issue (required)"),
      description: z
        .string()
        .optional()
        .describe("Detailed description of the issue"),
      issueType: z
        .string()
        .optional()
        .default("Task")
        .describe(
          'Issue type (e.g., "Task", "Bug", "Story", "Epic"). Defaults to "Task"'
        ),
      priority: z
        .string()
        .optional()
        .describe(
          'Priority level (e.g., "Highest", "High", "Medium", "Low", "Lowest")'
        ),
      labels: z
        .array(z.string())
        .optional()
        .describe("Labels to add to the issue"),
      projectKey: z
        .string()
        .optional()
        .describe(
          `Project key to create the issue in. Defaults to "${config.jiraProject}"`
        ),
    },
    async (params) => {
      try {
        const result = await jiraClient.createIssue({
          summary: params.summary,
          description: params.description,
          issueType: params.issueType,
          priority: params.priority,
          labels: params.labels,
          projectKey: params.projectKey,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  issue: {
                    id: result.id,
                    key: result.key,
                    url: result.self,
                  },
                  message: `Successfully created issue ${result.key}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: errorMessage,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Connect the server to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error("Jira MCP Server running on stdio");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
