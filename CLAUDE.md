# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An MCP (Model Context Protocol) server that exposes Jira REST API functionality to MCP clients like Claude Desktop, Cursor, and Claude Code. Built with Bun.

## Development Commands

```bash
bun run build      # Build standalone executable (includes Bun runtime)
bun run deploy     # Build and copy to ~/bin
bun run dev        # Run from source
bun test           # Run tests
bun run lint       # Check lint + format (biome check)
bun run lint:fix   # Auto-fix lint + format issues
```

Run a single test file:
```bash
bun test src/adf-schema.test.ts
```

## Environment Variables

Required: `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT`

## Architecture

### Build System

Uses **Bun's `--compile` flag** to create a standalone executable. The output (`dist/jira-mcp-server`) includes the Bun runtime and runs without a separate Bun installation.

### Module Structure

- **index.ts** - Entry point, orchestrates startup, handles `--help`
- **config.ts** - Validates environment variables, returns `JiraConfig`
- **server.ts** - Creates `McpServer`, registers tools with Zod schemas
- **jira-client.ts** - Jira REST API v3 client with Basic Auth
- **adf-schema.ts** - Zod schema for Atlassian Document Format validation
- **types.ts** - TypeScript interfaces
- **version.ts** - Reads version from package.json

### Key Patterns

**ADF Handling**: Jira requires Atlassian Document Format (ADF) for descriptions. The server accepts:
- Plain text → converted to paragraph nodes
- Pre-formatted ADF objects → passed directly to API

**Stdio Transport**: stdout is reserved for MCP protocol. All logging goes to stderr via `console.error()`.

**MCP Tool Registration**:
```typescript
server.tool(name, description, zodSchema, async (params) => {
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});
```

**Error Responses**: Return `{ isError: true }` in tool response for failures.

## Testing

```bash
# Unit tests
bun test

# Manual testing with MCP Inspector
bun run build
JIRA_URL="..." JIRA_EMAIL="..." JIRA_API_TOKEN="..." JIRA_PROJECT="..." \
  npx @modelcontextprotocol/inspector ./dist/jira-mcp-server
```

## Adding New Jira Operations

1. Add types to `types.ts`
2. Add method to `JiraClient` class
3. Register tool in `server.ts` with Zod schema
4. Return structured JSON with `success` boolean
5. Update README.md
