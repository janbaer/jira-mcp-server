# Jira MCP Server

An MCP (Model Context Protocol) server for creating Jira issues via the REST API. Built with Bun.

## About Bun

This project uses [Bun](https://bun.sh) instead of Node.js. Bun is an all-in-one toolkit for JavaScript and TypeScript—a fast, modern runtime designed as a drop-in replacement for Node.js. It ships as a single executable that includes a runtime, package manager, test runner, and bundler, with dramatically faster startup times and lower memory usage. It is also able to create single-file executable binaries with no external dependencies.

### Installing Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

After installation, verify it works:

```bash
bun --version
```

## Features

- Create Jira issues with a single tool call
- Support for all standard issue fields (summary, description, type, priority, labels)
- Flexible description input:
  - Plain text → automatic conversion to basic ADF paragraphs
  - Pre-formatted ADF objects → full control over formatting (panels, headings, lists, etc.)
- Runtime ADF validation with Zod schemas
- Standalone executable (no runtime dependencies)
- `--help` flag for quick setup reference

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

### Quick Reference

```bash
# Display setup instructions and configuration examples
./dist/jira-mcp-server --help
```

### Build

```bash
# Build standalone executable with Bun runtime included
bun run build
```

This creates a standalone executable at `dist/jira-mcp-server` that includes the Bun runtime and all dependencies.

### Deploy

```bash
# Build and deploy to ~/bin directory
bun run deploy
```

This builds the executable and copies it to `~/bin/jira-mcp-server` for system-wide access.

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

| Parameter     | Type              | Required | Description                                                  |
| ------------- | ----------------- | -------- | ------------------------------------------------------------ |
| `summary`     | `string`          | Yes      | Summary/title of the issue                                   |
| `description` | `string` or `ADF` | No       | Description as plain text OR pre-formatted ADF object        |
| `issueType`   | `string`          | No       | Issue type (default: "Task")                                 |
| `priority`    | `string`          | No       | Priority level ("Highest", "High", "Medium", "Low", "Lowest")|
| `labels`      | `string[]`        | No       | Labels to add to the issue                                   |
| `projectKey`  | `string`          | No       | Override the default project key                             |

**Description Formatting:**

You can provide the description in two ways:

1. **Plain text** (simple):
   ```
   "description": "Main description text.\n\nAnother paragraph."
   ```
   The server converts this to basic ADF paragraphs.

2. **Pre-formatted ADF object** (advanced):
   ```json
   "description": {
     "type": "doc",
     "version": 1,
     "content": [
       { "type": "paragraph", "content": [{ "type": "text", "text": "Main description" }] },
       { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "TODO" }] },
       { "type": "panel", "attrs": { "panelType": "error" }, "content": [
         { "type": "paragraph", "content": [{ "type": "text", "text": "First task" }] }
       ]}
     ]
   }
   ```
   The server passes this directly to Jira, giving you full control over formatting (panels, headings, lists, etc.).

Panel types: "error" (red), "info" (blue), "warning" (yellow), "success" (green), "note" (purple)

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

## Example Commands

### `jira-ticket` Command

An interactive command for drafting and creating Jira tickets with proper ADF formatting. This command demonstrates how to use the MCP server with advanced formatting features.

**Features:**
- Interactive ticket creation for Stories, Bugs, and Maintenance tasks
- Smart question flow based on ticket type
- Automatic ADF construction with red error panels for TODO and Acceptance Criteria
- Grammar checking and refinement workflow
- Integration with jira-mcp-server

**Location:** `command/jira-ticket.md`

**Usage:**
```bash
/jira-ticket [optional summary]
```

The command will guide you through creating a well-structured ticket and automatically format it with:
- Headings for TODO and Acceptance Criteria sections
- Red error panels for each TODO item (easily changed to green when completed)
- Red error panels for each acceptance criterion
- Proper paragraph formatting for descriptions

## Project Structure

```
jira-mcp-server/
├── src/
│   ├── index.ts           # Entry point, orchestrates startup
│   ├── config.ts          # Environment variable validation
│   ├── server.ts          # MCP server setup and tool registration
│   ├── jira-client.ts     # Jira REST API client
│   ├── adf-schema.ts      # Zod schema for ADF validation
│   ├── adf-schema.test.ts # ADF validation tests
│   ├── types.ts           # TypeScript type definitions
│   ├── help.ts            # Help text display
│   └── version.ts         # Version from package.json
├── dist/
│   └── jira-mcp-server    # Standalone executable (after build)
├── command/
│   └── jira-ticket.md     # Interactive ticket creation command
├── biome.json             # Linter/formatter configuration
└── package.json
```

## Available Scripts

| Script     | Description                                           |
| ---------- | ----------------------------------------------------- |
| `build`    | Build standalone executable with Bun runtime included |
| `deploy`   | Build and copy executable to ~/bin directory          |
| `dev`      | Run source directly with Bun (for development)        |
| `test`     | Run tests with Bun                                    |
| `lint`     | Check code with Biome (lint + format)                 |
| `lint:fix` | Auto-fix lint and format issues                       |

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
