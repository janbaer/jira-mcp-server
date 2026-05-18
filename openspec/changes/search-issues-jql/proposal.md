## Why

MCP clients currently have no way to search for existing Jira issues programmatically. Adding JQL (Jira Query Language) search enables agents and users to find issues by status, assignee, sprint, labels, or any other criteria — unlocking workflows that depend on discovering issues before acting on them.

## What Changes

- Add a new MCP tool `jira-search-issues` that accepts a JQL query string and returns matching issues
- The tool returns a list of issues with key fields (key, summary, status, assignee, priority, created/updated dates)
- Support optional `maxResults` parameter to limit response size (default 20, max 100)
- Support optional `fields` parameter to select which issue fields to return

## Capabilities

### New Capabilities

- `search-issues-jql`: MCP tool that queries the Jira search API with a JQL string and returns matching issues as structured JSON

### Modified Capabilities

## Impact

- `jira-client.ts`: New `searchIssues(jql, options)` method calling `GET /rest/api/3/search`
- `server.ts`: New tool registration for `jira-search-issues`
- `types.ts`: New types for search request/response
- `README.md`: Document the new tool
- `CHANGELOG.md`: Record the addition
