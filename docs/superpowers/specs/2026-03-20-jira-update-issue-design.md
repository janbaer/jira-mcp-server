# Design: jira-update-issue Tool

## Summary

Add a `jira-update-issue` MCP tool that updates an existing Jira issue's summary and/or description.

## Tool Schema

| Parameter     | Type              | Required | Description                                                                 |
|---------------|-------------------|----------|-----------------------------------------------------------------------------|
| `issueKey`    | string            | yes      | The issue key, e.g. `"PROJ-123"`                                           |
| `summary`     | string            | no       | New summary/title for the issue                                             |
| `description` | string \| ADF     | no       | New description — plain text (auto-converted to ADF) or pre-formatted ADF   |

**Constraint:** At least one of `summary` or `description` must be provided. Validated at runtime before calling the Jira API.

## Jira API

`PUT /rest/api/3/issue/{issueKey}` with body:

```json
{
  "fields": {
    "summary": "new title",
    "description": { "type": "doc", "version": 1, "content": [...] }
  }
}
```

Only provided fields are included in the request body. The Jira API returns `204 No Content` on success.

## Response Format

Success:
```json
{
  "success": true,
  "issue": { "key": "PROJ-123", "url": "https://jira.example.com/browse/PROJ-123" },
  "message": "Successfully updated issue PROJ-123"
}
```

Error (no fields provided):
```json
{
  "success": false,
  "error": "At least one of 'summary' or 'description' must be provided"
}
```

Error (API failure): same pattern as existing tools, using `isError: true`.

## File Changes

### 1. `src/types.ts` — Add `UpdateIssueInput`

```typescript
export interface UpdateIssueInput {
  issueKey: string;
  summary?: string;
  description?: string | AtlassianDocumentFormat;
}
```

### 2. `src/jira-client.ts` — Add `updateIssue()` method

- Add `UpdateIssueInput` to the import statement
- Accepts `UpdateIssueInput`
- Builds `fields` object with only provided fields
- Reuses the private `toADF()` method for plain-text description conversion (no visibility change needed)
- Uses `encodeURIComponent(issueKey)` in the URL path, consistent with `getIssue`
- Calls `PUT /rest/api/3/issue/{issueKey}`
- Returns `{ key, url }` on success (204)
- Throws on error using existing error-handling pattern

### 3. `src/server.ts` — Register `jira-update-issue` tool

- Zod schema: `issueKey` as `z.string().min(1)` (consistent with `jira-get-issue`), `summary` and `description` optional
- Runtime guard: return `isError: true` if neither optional field is provided
- On success, return structured JSON matching existing tool patterns

### 4. `package.json` — Bump version

- Increment minor version (per project conventions in CLAUDE.md)

### 5. `CHANGELOG.md` — Add entry

- Document the new `jira-update-issue` tool under the new version

### 6. `README.md` — Document the new tool

- Add `jira-update-issue` to the tool reference section

## Design Decisions

- **Both fields optional with runtime validation** — matches Jira API semantics and avoids forcing callers to echo unchanged fields
- **Same ADF handling as create** — reuses `toADF()` for consistency
- **No `id` in success response** — unlike `jira-create-issue`, the update API returns `204 No Content` with no body, so `id` is unavailable; only `key` and `url` are returned
- **No status/assignee/priority updates** — intentionally scoped to summary and description for now; can be extended later
