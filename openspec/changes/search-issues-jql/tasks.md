## 1. Types

- [x] 1.1 Add `SearchIssuesInput` interface to `types.ts` (jql, maxResults, fields)
- [x] 1.2 Add `SearchIssuesResponse` interface to `types.ts` (issues array, total count)

## 2. Jira Client

- [x] 2.1 Add `searchIssues(input: SearchIssuesInput)` method to `JiraClient` calling `GET /rest/api/3/search`
- [x] 2.2 Map Jira API fields to `GetIssueResponse` shape (reuse existing field mapping logic)
- [x] 2.3 Clamp `maxResults` to 100 and default to 20

## 3. MCP Tool Registration

- [x] 3.1 Register `jira-search-issues` tool in `server.ts` with Zod schema (jql required, maxResults optional)
- [x] 3.2 Return structured JSON with `success`, `total`, and `issues` array

## 4. Tests

- [x] 4.1 Write unit tests for the new client method covering: successful search, empty results, invalid JQL error

## 5. Documentation

- [x] 5.1 Add `jira-search-issues` tool to `README.md` with JQL examples
- [x] 5.2 Update `CHANGELOG.md` with the new tool
- [x] 5.3 Bump minor version in `package.json`
