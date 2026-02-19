import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { adfSchema } from "./adf-schema";
import type { JiraClient } from "./jira-client";
import type { JiraConfig } from "./types";
import { NAME, VERSION } from "./version";

export function createMcpServer(
  config: JiraConfig,
  jiraClient: JiraClient,
): McpServer {
  const server = new McpServer({
    name: NAME,
    version: VERSION,
  });

  server.tool(
    "jira-create-issue",
    "Create a new issue in Jira. Returns the issue key and URL.",
    {
      summary: z
        .string()
        .min(1)
        .describe("Summary/title of the issue (required)"),
      description: z
        .union([z.string(), adfSchema])
        .optional()
        .describe(
          "Detailed description - either plain text (converted to paragraphs) or pre-formatted ADF object",
        ),
      issueType: z
        .string()
        .optional()
        .default("Task")
        .describe(
          'Issue type (e.g., "Task", "Bug", "Story", "Epic"). Defaults to "Task"',
        ),
      priority: z
        .string()
        .optional()
        .describe(
          'Priority level (e.g., "Highest", "High", "Medium", "Low", "Lowest")',
        ),
      labels: z
        .array(z.string())
        .optional()
        .describe("Labels to add to the issue"),
      projectKey: z
        .string()
        .optional()
        .describe(
          `Project key to create the issue in. Defaults to "${config.jiraProject}"`,
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
                2,
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
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "jira-get-issue",
    "Get details of an existing Jira issue by its key (e.g. PROJ-123).",
    {
      issueKey: z.string().min(1).describe('The issue key (e.g. "PROJ-123")'),
    },
    async (params) => {
      try {
        const result = await jiraClient.getIssue(params.issueKey);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  issue: result,
                },
                null,
                2,
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
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}

export async function startServer(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Jira MCP Server running on stdio");
}
