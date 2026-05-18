## Why

When creating sub-tasks or child issues in Jira, the parent issue key must be set at creation time. Without this field the `jira-create-issue` tool can only create top-level issues, forcing users to manually link children in the UI afterwards.

## What Changes

- Add an optional `parentKey` parameter to the `jira-create-issue` MCP tool (e.g. `"PROJ-10"`)
- When provided, the issue is created as a child of the specified parent

## Capabilities

### New Capabilities

### Modified Capabilities

- `create-issue-parent-field`: `jira-create-issue` gains an optional `parentKey` field that sets the parent issue at creation time

## Impact

- `types.ts`: Add `parentKey?: string` to `CreateIssueInput`
- `jira-client.ts`: Pass `parent: { key: parentKey }` in the request body when `parentKey` is set
- `server.ts`: Add optional `parentKey` Zod field to the `jira-create-issue` tool schema
- `README.md`: Document the new parameter
