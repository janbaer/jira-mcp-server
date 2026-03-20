# Jira MCP Server

An MCP (Model Context Protocol) server for creating and fetching Jira issues via the REST API. Built with [Bun](https://bun.sh).

## Features

- Fetch and update existing Jira issues
- Create Jira issues with a single tool call
- Support for all standard issue fields (summary, description, type, priority, labels)
- Flexible description input:
  - Plain text → automatic conversion to basic ADF paragraphs
  - Pre-formatted ADF objects → full control over formatting (panels, headings, lists, etc.)
- Runtime ADF validation with Zod schemas
- Standalone executable (no runtime dependencies)
- `--help` flag for quick setup reference

## Prerequisites

- [Bun](https://bun.sh) v1.0+ — install with `curl -fsSL https://bun.sh/install | bash`
- A Jira Cloud instance
- Jira API token (see [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens))

## Installation

```bash
git clone <your-repo-url>
cd jira-mcp-server
bun install
```

## Configuration

The server requires these environment variables:

| Variable         | Description                                | Example                             |
| ---------------- | ------------------------------------------ | ----------------------------------- |
| `JIRA_URL`       | Your Jira instance URL                     | `https://your-domain.atlassian.net` |
| `JIRA_EMAIL`     | Your Jira account email                    | `user@example.com`                  |
| `JIRA_API_TOKEN` | Your Jira API token                        | `your-api-token`                    |
| `JIRA_PROJECT`   | Default project key for issue creation     | `PROJ`                              |

## Usage

```bash
# Build standalone executable
bun run build

# Build and deploy to ~/bin
bun run deploy

# Run from source (development)
bun run dev

# Inspect with MCP Inspector
bun run mcp-inspect

# Display setup instructions
./dist/jira-mcp-server --help
```

## Integration with MCP Clients

### Claude Desktop

Add to your config file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

For development (running from source), replace `command` with `"bun"` and add `"args": ["run", "/absolute/path/to/jira-mcp-server/src/index.ts"]`.

### Cursor

1. Open Cursor Settings → Features → MCP
2. Add a new MCP server:
   - **Transport type:** stdio
   - **Command:** `/absolute/path/to/jira-mcp-server/dist/jira-mcp-server`
3. Set the environment variables in Cursor's settings

### Claude Code

```bash
claude mcp add jira /absolute/path/to/jira-mcp-server/dist/jira-mcp-server
```

## Tool Reference

### `jira-get-issue`

Fetches an existing Jira issue by its key.

| Parameter  | Type     | Required | Description                     |
| ---------- | -------- | -------- | ------------------------------- |
| `issueKey` | `string` | Yes      | The issue key (e.g. "PROJ-123") |

**Example response:**

```json
{
  "success": true,
  "issue": {
    "key": "PROJ-123",
    "summary": "Fix login button on mobile",
    "status": "In Progress",
    "priority": "High",
    "issueType": "Bug",
    "assignee": "Jane Doe",
    "reporter": "John Smith",
    "labels": ["mobile", "frontend"],
    "description": { "type": "doc", "version": 1, "content": [] },
    "created": "2026-02-19T10:00:00.000+0000",
    "updated": "2026-02-19T12:30:00.000+0000",
    "url": "https://your-domain.atlassian.net/browse/PROJ-123"
  }
}
```

### `jira-update-issue`

Updates an existing Jira issue's summary and/or description. At least one field must be provided.

| Parameter     | Type              | Required | Description                        |
| ------------- | ----------------- | -------- | ---------------------------------- |
| `issueKey`    | `string`          | Yes      | The issue key (e.g. "PROJ-123")    |
| `summary`     | `string`          | No       | New summary/title for the issue    |
| `description` | `string` or `ADF` | No       | Plain text or pre-formatted ADF    |

**Example response:**

```json
{
  "success": true,
  "issue": {
    "key": "PROJ-123",
    "url": "https://your-domain.atlassian.net/browse/PROJ-123"
  },
  "message": "Successfully updated issue PROJ-123"
}
```

### `jira-create-issue`

Creates a new issue in Jira.

| Parameter     | Type              | Required | Description                                                   |
| ------------- | ----------------- | -------- | ------------------------------------------------------------- |
| `summary`     | `string`          | Yes      | Summary/title of the issue                                    |
| `description` | `string` or `ADF` | No       | Plain text or pre-formatted ADF object                        |
| `issueType`   | `string`          | No       | Issue type (default: "Task")                                  |
| `priority`    | `string`          | No       | Priority level ("Highest", "High", "Medium", "Low", "Lowest") |
| `labels`      | `string[]`        | No       | Labels to add to the issue                                    |
| `projectKey`  | `string`          | No       | Override the default project key                              |

**Description formatting:**

Plain text is converted to ADF paragraphs automatically:
```
"description": "Main description.\n\nAnother paragraph."
```

For full formatting control, pass a pre-formatted ADF object:
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

Panel types: `error` (red), `info` (blue), `warning` (yellow), `success` (green), `note` (purple).

**Example response:**

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

### `jira-ticket`

An interactive command for drafting and creating Jira tickets with proper ADF formatting. Supports Stories, Bugs, and Maintenance tasks with a smart question flow and automatic ADF construction.

**Location:** `command/jira-ticket.md`

```bash
/jira-ticket [optional summary]
```

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

| Script        | Description                                           |
| ------------- | ----------------------------------------------------- |
| `build`       | Build standalone executable with Bun runtime included |
| `deploy`      | Build and copy executable to ~/bin directory          |
| `dev`         | Run source directly with Bun (for development)        |
| `test`        | Run tests with Bun                                    |
| `lint`        | Check code with Biome (lint + format)                 |
| `lint:fix`    | Auto-fix lint and format issues                       |
| `mcp-inspect` | Build and launch MCP Inspector for manual testing     |

## Future Improvements

- [ ] Add more Jira operations (delete, search, comment, transitions)
- [ ] Support for custom fields
- [ ] Support for attachments
- [ ] Caching of project/issue type metadata
- [ ] Support for Jira Server/Data Center (different auth method)
- [ ] Add assignee field support
- [ ] Add component support

## License

MIT
