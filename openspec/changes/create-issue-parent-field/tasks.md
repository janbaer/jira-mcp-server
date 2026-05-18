## 1. Types & Client

- [x] 1.1 Add `parentKey?: string` to `CreateIssueInput` in `types.ts`
- [x] 1.2 Pass `parent: { key: parentKey }` in the request body inside `JiraClient.createIssue()` when `parentKey` is set

## 2. MCP Tool

- [x] 2.1 Add optional `parentKey` Zod field to the `jira-create-issue` schema in `server.ts`
- [x] 2.2 Forward `parentKey` from tool params to `jiraClient.createIssue()`

## 3. Documentation

- [x] 3.1 Add `parentKey` parameter to the `jira-create-issue` section in `README.md`
