## Context

The server currently supports creating, reading, and updating Jira issues but has no search capability. Adding JQL search fills the most common missing workflow: finding issues before acting on them. The Jira REST API exposes `GET /rest/api/3/search` for this purpose.

The existing `JiraClient` follows a consistent pattern: one method per operation, returning a typed response object. `server.ts` registers each operation as an MCP tool with a Zod schema.

## Goals / Non-Goals

**Goals:**
- Add `jira-search-issues` MCP tool accepting a JQL string
- Return a concise list of issues (key, summary, status, assignee, priority, issue type, created, updated, URL)
- Support `maxResults` (default 20, capped at 100) and optional `fields` override
- Reuse the existing `GetIssueResponse` shape for each result item (consistent field naming)

**Non-Goals:**
- Pagination beyond `maxResults` — single-page results only
- Full ADF description in search results — descriptions are expensive to serialize and rarely needed in a list
- Project-scoping as a first-class parameter — callers can include `project = X` in JQL

## Decisions

**Return `GetIssueResponse[]` shape per issue** — reuses the already-defined interface and keeps the client consistent. Callers familiar with `jira-get-issue` output can reason about `jira-search-issues` output without reading new docs.

**Use `fields` query param, not `expand`** — `fields` limits the Jira API payload precisely. Default fields: `summary,status,priority,issuetype,assignee,reporter,labels,created,updated`. This mirrors what `getIssue()` fetches, so the same response-mapping helper can be shared.

**No description in results** — descriptions are ADF blobs; including them in a list response would make the output unwieldy. Callers who need the description can follow up with `jira-get-issue`.

**Cap `maxResults` at 100** — Jira's own hard limit for this endpoint is 100. Enforcing it client-side avoids a confusing API error.

## Risks / Trade-offs

- **JQL injection**: JQL is passed directly to the Jira API; Jira's own parser handles validation. The risk is a poorly formed query returning an error rather than a security issue — Jira's auth boundary is unchanged.
- **Large payloads**: With `maxResults=100` and many fields, responses can be verbose. Mitigated by the fixed default field set.
- **Jira rate limits**: No throttling built in — consistent with the rest of the client.
