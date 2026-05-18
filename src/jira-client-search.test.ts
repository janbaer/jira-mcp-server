import { describe, expect, mock, test } from "bun:test";
import { JiraClient } from "./jira-client";

const config = {
  jiraUrl: "https://test.atlassian.net",
  jiraEmail: "test@example.com",
  jiraApiToken: "token123",
  jiraProject: "TEST",
};

function makeIssue(key: string) {
  return {
    key,
    fields: {
      summary: `Summary for ${key}`,
      status: { name: "In Progress" },
      priority: { name: "Medium" },
      issuetype: { name: "Story" },
      assignee: { displayName: "Alice" },
      reporter: { displayName: "Bob" },
      labels: ["backend"],
      created: "2024-01-01T00:00:00.000Z",
      updated: "2024-01-02T00:00:00.000Z",
    },
  };
}

describe("JiraClient.searchIssues", () => {
  test("returns mapped issues on successful search", async () => {
    const client = new JiraClient(config);

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            total: 2,
            issues: [makeIssue("TEST-1"), makeIssue("TEST-2")],
          }),
          { status: 200 },
        ),
      ),
    ) as typeof fetch;

    const result = await client.searchIssues({ jql: "project = TEST" });

    expect(result.total).toBe(2);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toMatchObject({
      key: "TEST-1",
      summary: "Summary for TEST-1",
      status: "In Progress",
      priority: "Medium",
      issueType: "Story",
      assignee: "Alice",
      reporter: "Bob",
      labels: ["backend"],
      url: "https://test.atlassian.net/browse/TEST-1",
    });
  });

  test("returns empty array when no issues match", async () => {
    const client = new JiraClient(config);

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ total: 0, issues: [] }), { status: 200 }),
      ),
    ) as typeof fetch;

    const result = await client.searchIssues({ jql: "project = NONE" });

    expect(result.total).toBe(0);
    expect(result.issues).toHaveLength(0);
  });

  test("throws on invalid JQL (400 error)", async () => {
    const client = new JiraClient(config);

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            errorMessages: ["Error in the JQL Query: unknown issue type"],
            errors: {},
          }),
          { status: 400, statusText: "Bad Request" },
        ),
      ),
    ) as typeof fetch;

    await expect(
      client.searchIssues({ jql: "issuetype = !!invalid" }),
    ).rejects.toThrow("Error in the JQL Query");
  });

  test("defaults maxResults to 20 and caps at 100", async () => {
    const client = new JiraClient(config);
    const bodies: unknown[] = [];

    globalThis.fetch = mock((_url: string, init?: RequestInit) => {
      bodies.push(JSON.parse(init?.body as string));
      return Promise.resolve(
        new Response(JSON.stringify({ total: 0, issues: [] }), { status: 200 }),
      );
    }) as typeof fetch;

    await client.searchIssues({ jql: "project = TEST" });
    expect((bodies[0] as { maxResults: number }).maxResults).toBe(20);

    await client.searchIssues({ jql: "project = TEST", maxResults: 200 });
    expect((bodies[1] as { maxResults: number }).maxResults).toBe(100);
  });
});
