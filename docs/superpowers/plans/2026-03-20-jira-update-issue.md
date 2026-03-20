# jira-update-issue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `jira-update-issue` MCP tool that updates an existing Jira issue's summary and/or description.

**Architecture:** Follows the existing three-file pattern (types → client → server). The Jira REST API `PUT /rest/api/3/issue/{key}` returns 204 No Content, so the response is constructed from the input key and config URL.

**Tech Stack:** Bun, TypeScript, Zod, @modelcontextprotocol/sdk

**Spec:** `docs/superpowers/specs/2026-03-20-jira-update-issue-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types.ts` | Modify | Add `UpdateIssueInput` interface |
| `src/jira-client.ts` | Modify | Add `updateIssue()` method |
| `src/server.ts` | Modify | Register `jira-update-issue` tool |
| `package.json` | Modify | Bump version to 1.3.0 |
| `CHANGELOG.md` | Modify | Add 1.3.0 entry |
| `README.md` | Modify | Add tool reference for `jira-update-issue` |

---

### Task 1: Add `UpdateIssueInput` type

**Files:**
- Modify: `src/types.ts:43` (after `CreateIssueResponse`)

- [ ] **Step 1: Add the interface**

Add after line 43 (after `CreateIssueResponse`):

```typescript
/**
 * Input parameters for updating a Jira issue
 */
export interface UpdateIssueInput {
  /** The issue key (e.g. "PROJ-123") */
  issueKey: string;
  /** New summary/title for the issue */
  summary?: string;
  /** New description - either plain text or pre-formatted ADF object */
  description?: string | AtlassianDocumentFormat;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/jan/Projects/jira-mcp-server && bun build src/index.ts --compile --outfile dist/jira-mcp-server`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "types ✨: Adding UpdateIssueInput interface"
```

---

### Task 2: Add `updateIssue()` method to JiraClient

**Files:**
- Modify: `src/jira-client.ts:1-8` (imports)
- Modify: `src/jira-client.ts:205` (after `getIssue` method, before `testConnection`)

- [ ] **Step 1: Add `UpdateIssueInput` to imports**

Update the import block at line 1-8 to include `UpdateIssueInput`:

```typescript
import type {
  AtlassianDocumentFormat,
  CreateIssueInput,
  CreateIssueResponse,
  GetIssueResponse,
  JiraConfig,
  JiraErrorResponse,
  UpdateIssueInput,
} from "./types";
```

- [ ] **Step 2: Add `updateIssue()` method**

Add after the `getIssue` method (after line 205), before `testConnection`:

```typescript
  /**
   * Update an existing Jira issue
   */
  async updateIssue(
    input: UpdateIssueInput,
  ): Promise<{ key: string; url: string }> {
    const fields: Record<string, unknown> = {};

    if (input.summary) {
      fields.summary = input.summary;
    }

    if (input.description) {
      fields.description =
        typeof input.description === "string"
          ? this.toADF(input.description)
          : input.description;
    }

    const response = await fetch(
      `${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(input.issueKey)}`,
      {
        method: "PUT",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ fields }),
      },
    );

    if (!response.ok) {
      let errorMessage = `Jira API error: ${response.status} ${response.statusText}`;

      try {
        const errorBody = (await response.json()) as JiraErrorResponse;
        if (errorBody.errorMessages && errorBody.errorMessages.length > 0) {
          errorMessage += ` - ${errorBody.errorMessages.join(", ")}`;
        }
        if (errorBody.errors) {
          const fieldErrors = Object.entries(errorBody.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          if (fieldErrors) {
            errorMessage += ` - Field errors: ${fieldErrors}`;
          }
        }
      } catch {
        // Could not parse error response
      }

      throw new Error(errorMessage);
    }

    return {
      key: input.issueKey,
      url: `${this.baseUrl}/browse/${input.issueKey}`,
    };
  }
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /home/jan/Projects/jira-mcp-server && bun build src/index.ts --compile --outfile dist/jira-mcp-server`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/jira-client.ts
git commit -m "jira-client ✨: Adding updateIssue method"
```

---

### Task 3: Register `jira-update-issue` tool in server

**Files:**
- Modify: `src/server.ts:158` (after `jira-get-issue` tool registration, before `return server`)

- [ ] **Step 1: Add tool registration**

Add after line 158 (after the `jira-get-issue` tool block closing), before `return server`:

```typescript
  server.tool(
    "jira-update-issue",
    "Update an existing Jira issue's summary and/or description. At least one field must be provided.",
    {
      issueKey: z.string().min(1).describe('The issue key (e.g. "PROJ-123")'),
      summary: z
        .string()
        .min(1)
        .optional()
        .describe("New summary/title for the issue"),
      description: z
        .union([z.string(), adfSchema])
        .optional()
        .describe(
          "New description - either plain text (converted to paragraphs) or pre-formatted ADF object",
        ),
    },
    async (params) => {
      if (!params.summary && !params.description) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "At least one of 'summary' or 'description' must be provided",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        const result = await jiraClient.updateIssue({
          issueKey: params.issueKey,
          summary: params.summary,
          description: params.description,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  issue: {
                    key: result.key,
                    url: result.url,
                  },
                  message: `Successfully updated issue ${result.key}`,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: errorMessage,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/jan/Projects/jira-mcp-server && bun build src/index.ts --compile --outfile dist/jira-mcp-server`
Expected: Build succeeds

- [ ] **Step 3: Run lint**

Run: `cd /home/jan/Projects/jira-mcp-server && bun run lint`
Expected: No errors

- [ ] **Step 4: Run existing tests**

Run: `cd /home/jan/Projects/jira-mcp-server && bun test`
Expected: All existing tests pass

- [ ] **Step 5: Commit**

```bash
git add src/server.ts
git commit -m "server ✨: Registering jira-update-issue tool"
```

---

### Task 4: Bump version and update docs

**Files:**
- Modify: `package.json:3` (version field)
- Modify: `CHANGELOG.md:8` (add new version entry before 1.2.0)
- Modify: `README.md:101-131` (Tool Reference section)

- [ ] **Step 1: Bump version in package.json**

Change line 3 from `"version": "1.1.0"` to `"version": "1.3.0"`.

Note: package.json shows 1.1.0 but CHANGELOG already has a 1.2.0 entry, so the next version is 1.3.0.

- [ ] **Step 2: Add CHANGELOG entry**

Add before the `## [1.2.0]` line:

```markdown
## [1.3.0] - 2026-03-20

### Added

- `jira-update-issue` tool to update an existing issue's summary and/or description

```

- [ ] **Step 3: Add tool reference to README**

Add after the `jira-get-issue` tool reference section (after line 131), before `### jira-create-issue`:

```markdown
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

```

- [ ] **Step 4: Update README Features list**

Update the Features list to include updating issues. Change the first line from:
```
- Fetch existing Jira issues by key
```
to:
```
- Fetch and update existing Jira issues
```

- [ ] **Step 5: Update README Future Improvements**

Remove "update" from the future improvements line:
```
- [ ] Add more Jira operations (delete, search, comment, transitions)
```

- [ ] **Step 6: Commit**

```bash
git add package.json CHANGELOG.md README.md
git commit -m "docs ✨: Adding v1.3.0 release docs for jira-update-issue"
```
