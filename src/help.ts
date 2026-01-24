export function showHelp(): void {
  const helpText = `
Jira MCP Server

An MCP server for creating Jira issues via the Jira REST API.

REQUIRED ENVIRONMENT VARIABLES:

  JIRA_URL          Your Jira instance URL
                    Example: https://your-domain.atlassian.net

  JIRA_EMAIL        Your Jira account email
                    Example: user@example.com

  JIRA_API_TOKEN    Your Jira API token (get from Atlassian account)
                    Example: your-api-token-here

  JIRA_PROJECT      Default project key for creating issues
                    Example: PROJ

CLAUDE DESKTOP CONFIGURATION:

Add this to your Claude Desktop config file:
  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
  Windows: %APPDATA%\\Claude\\claude_desktop_config.json

{
  "mcpServers": {
    "jira": {
      "command": "/path/to/jira-mcp-server",
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "user@example.com",
        "JIRA_API_TOKEN": "your-token",
        "JIRA_PROJECT": "PROJ"
      }
    }
  }
}

CLAUDE CODE:

  claude mcp add jira /path/to/jira-mcp-server

Then configure environment variables in Claude Code settings.

For other MCP clients (Cursor, etc.), use similar JSON configuration.
`;

  console.log(helpText);
  process.exit(0);
}
