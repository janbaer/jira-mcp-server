# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that exposes Jira REST API functionality to MCP clients like Claude Desktop, Cursor, and Claude Code. It allows LLMs to create Jira issues through a single tool call. Built with Bun.

## Development Commands

```bash
# Build standalone executable with Bun runtime included
bun run build

# Build and deploy to ~/bin directory
bun run deploy

# Development mode (run from source)
bun run dev

# Run the built executable
./dist/jira-mcp-server
```

## Environment Setup

Required environment variables:
- `JIRA_URL` - Jira instance URL (e.g., https://your-domain.atlassian.net)
- `JIRA_EMAIL` - Jira account email
- `JIRA_API_TOKEN` - Jira API token
- `JIRA_PROJECT` - Default project key

See `.env.example` for reference.

## Architecture

### Build System

This project uses **Bun's `--compile` flag** to create a standalone executable that includes the Bun runtime and all dependencies. The build command (`bun build src/index.ts --compile --outfile dist/jira-mcp-server`) produces a single executable file that can run without a separate Bun installation.

The `deploy` script builds the executable and copies it to `~/bin` for system-wide access.

### Core Components

**src/index.ts** - MCP server entry point
- Creates `McpServer` instance from `@modelcontextprotocol/sdk`
- Registers the `jira-create-issue` tool with Zod schema validation
- Connects server to stdio transport for MCP communication
- All logging must go to stderr (stdout is reserved for MCP protocol)
- Shebang (`#!/usr/bin/env bun`) allows direct execution without `bun run` prefix

**src/jira-client.ts** - Jira REST API client
- Handles authentication via Basic Auth (email:token base64 encoded)
- Converts plain text descriptions to Atlassian Document Format (ADF)
- Makes API calls to Jira REST API v3
- Provides detailed error messages by parsing Jira error responses

**src/types.ts** - TypeScript type definitions
- `JiraConfig` - Server configuration
- `CreateIssueInput` - Issue creation parameters
- `CreateIssueResponse` - API response structure
- `AtlassianDocumentFormat` - ADF structure for descriptions

### Key Design Patterns

**ADF Conversion**: The Jira Cloud API requires descriptions in Atlassian Document Format (ADF), not plain text. The `toADF()` method in `jira-client.ts` converts plain text to ADF by splitting on double newlines and creating paragraph nodes.

**MCP Tool Pattern**: Tools are registered with the server using `server.tool()` which takes:
1. Tool name (string)
2. Description (string)
3. Schema (Zod object)
4. Handler function (async)

**Error Handling**: All tool handlers must return structured responses with `success` boolean and either result data or error messages. Use `isError: true` in the response object to signal failures.

**Stdio Transport**: The server uses stdio transport, meaning:
- stdin/stdout are used for MCP protocol communication
- All debug/info logging MUST go to stderr
- Never write to stdout directly

## Testing

Use the MCP Inspector to test the server locally:

```bash
# Build first
bun run build

# Run inspector
JIRA_URL="..." JIRA_EMAIL="..." JIRA_API_TOKEN="..." JIRA_PROJECT="..." \
npx @modelcontextprotocol/inspector ./dist/jira-mcp-server
```

## Common Patterns

When adding new Jira operations:
1. Add input/response types to `types.ts`
2. Add method to `JiraClient` class in `jira-client.ts`
3. Register new tool in `index.ts` with proper Zod schema
4. Handle errors and return structured JSON response
5. Update README.md with new tool documentation
