## Context

`jira-create-issue` builds a request body with a `fields` object and POSTs to `/rest/api/3/issue`. The Jira REST API sets the parent via `fields.parent.key`. The existing `CreateIssueInput` type and client method need a single optional field added each.

## Goals / Non-Goals

**Goals:**
- Thread `parentKey` from the MCP tool parameter through the type, client, and API call

**Non-Goals:**
- Validating that the parent key exists before sending (Jira returns a clear error if it doesn't)
- Supporting parent by ID (key is the canonical human-readable identifier already used throughout)
- Updating the parent on existing issues

## Decisions

**Use `parentKey` as the parameter name** — consistent with `issueKey` already used in `UpdateIssueInput` and `GetIssueResponse`. Using `parent` alone would be ambiguous about whether it takes a key, ID, or object.

**Pass `{ parent: { key: parentKey } }` in the request body** — this is the format the Jira REST API v3 expects for both sub-tasks and next-gen child issues.

## Risks / Trade-offs

- Classic Jira projects require the issue type to be "Sub-task" for child issues; next-gen projects accept any type. An invalid combination returns a Jira API error, which the client already propagates — no extra handling needed.
