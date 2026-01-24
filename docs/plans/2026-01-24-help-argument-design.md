# Help Argument Design

**Date:** 2026-01-24
**Status:** Approved

## Problem

Running `jira-mcp-server --help` currently causes an error because the server doesn't handle command-line arguments. Users need an easy way to see setup instructions without reading the full README.

## Solution

Add a help argument handler that displays environment variables and configuration examples before the MCP server initializes.

## Design

### Argument Detection

Check for `--help` or `-h` arguments at the very start of `src/index.ts`, before MCP server initialization or environment validation.

If help is requested:
1. Display help text to stdout
2. Exit with code 0 (success)

### Help Text Content

```
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
  Windows: %APPDATA%\Claude\claude_desktop_config.json

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
```

### Implementation Details

**Location:** `src/index.ts` at the very top, before any other logic

**Exit behavior:** `process.exit(0)` after displaying help

**Output stream:** stdout (not stderr) so users can pipe the output

## Benefits

- Quick reference for setup without opening README
- Standard CLI behavior (most tools support --help)
- Prevents confusing error when run with --help
- Easy to copy/paste configuration examples
