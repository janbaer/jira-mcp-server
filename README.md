# Jira MCP Server

An MCP (Model Context Protocol) server for creating Jira issues via the REST API. Built with Bun.

## Features

- Create Jira issues with a single tool call
- Support for all standard issue fields (summary, description, type, priority, labels)
- Proper Atlassian Document Format (ADF) for descriptions
- Error handling with detailed error messages

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- A Jira Cloud instance
- Jira API token (see [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens))

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd jira-mcp-server

# Install dependencies
bun install
```

## Configuration

The server requires the following environment variables:

| Variable         | Description                                              | Example                             |
| ---------------- | -------------------------------------------------------- | ----------------------------------- |
| `JIRA_URL`       | Your Jira instance URL                                   | `https://your-domain.atlassian.net` |
| `JIRA_EMAIL`     | Your Jira account email                                  | `user@example.com`                  |
| `JIRA_API_TOKEN` | Your Jira API token                                      | `your-api-token`                    |
| `JIRA_PROJECT`   | Default project key for issue creation                   | `PROJ`                              |

### Getting a Jira API Token

1. Go to [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a descriptive name and click "Create"
4. Copy the token (you won't be able to see it again)

## Usage

### Build

```bash
# Build standalone executable with Bun runtime included
bun run build
```

This creates a standalone executable at `dist/jira-mcp-server` that includes the Bun runtime and all dependencies.

### Development Mode

```bash
# Set environment variables
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="user@example.com"
export JIRA_API_TOKEN="your-token"
export JIRA_PROJECT="PROJ"

# Run directly from source
bun run dev

# Or run the source file directly (since it has #!/usr/bin/env bun shebang)
./src/index.ts
```

### Production Mode

```bash
# Build the executable first
bun run build

# Run the standalone executable
./dist/jira-mcp-server
```

### Testing with MCP Inspector

```bash
# Build first
bun run build

# Run the inspector with your server
JIRA_URL="https://your-domain.atlassian.net" \
JIRA_EMAIL="user@example.com" \
JIRA_API_TOKEN="your-token" \
JIRA_PROJECT="PROJ" \
npx @modelcontextprotocol/inspector ./dist/jira-mcp-server
```

## Integration with MCP Clients

### Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Production (using built executable):
```json
{
  "mcpServers": {
    "jira": {
      "command": "/absolute/path/to/jira-mcp-server/dist/jira-mcp-server",
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "user@example.com",
        "JIRA_API_TOKEN": "your-token",
        "JIRA_PROJECT": "PROJ"
      }
    }
  }
}
```

Development (running from source):
```json
{
  "mcpServers": {
    "jira": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/jira-mcp-server/src/index.ts"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "user@example.com",
        "JIRA_API_TOKEN": "your-token",
        "JIRA_PROJECT": "PROJ"
      }
    }
  }
}
```

### Cursor

1. Open Cursor Settings → Features → MCP
2. Add a new MCP server with:
   - **Transport type:** stdio
   - **Command:** `/absolute/path/to/jira-mcp-server/dist/jira-mcp-server`
3. Set the environment variables in Cursor's settings

### Claude Code

```bash
claude mcp add jira /absolute/path/to/jira-mcp-server/dist/jira-mcp-server
```

## Tool Reference

### `jira-create-issue`

Creates a new issue in Jira.

**Parameters:**

| Parameter     | Type       | Required | Description                                                  |
| ------------- | ---------- | -------- | ------------------------------------------------------------ |
| `summary`     | `string`   | Yes      | Summary/title of the issue                                   |
| `description` | `string`   | No       | Detailed description of the issue                            |
| `issueType`   | `string`   | No       | Issue type (default: "Task")                                 |
| `priority`    | `string`   | No       | Priority level ("Highest", "High", "Medium", "Low", "Lowest")|
| `labels`      | `string[]` | No       | Labels to add to the issue                                   |
| `projectKey`  | `string`   | No       | Override the default project key                             |

**Example Response:**

```json
{
  "success": true,
  "issue": {
    "id": "10001",
    "key": "PROJ-123",
    "url": "https://your-domain.atlassian.net/browse/PROJ-123"
  },
  "message": "Successfully created issue PROJ-123"
}
```

## Project Structure

```
jira-mcp-server/
├── src/
│   ├── index.ts         # MCP server entry point
│   ├── jira-client.ts   # Jira REST API client
│   └── types.ts         # TypeScript type definitions
├── dist/
│   └── jira-mcp-server  # Standalone executable (after bun run build)
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

| Script        | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| `build`       | Build standalone executable with Bun runtime included            |
| `dev`         | Run source directly with Bun (for development)                   |

## Future Improvements

Some ideas for extending this server:

- [ ] Add more Jira operations (update, delete, search, comment)
- [ ] Support for custom fields
- [ ] Support for attachments
- [ ] Caching of project/issue type metadata
- [ ] Support for Jira Server/Data Center (different auth method)
- [ ] Add assignee field support
- [ ] Add component support

## License

MIT
