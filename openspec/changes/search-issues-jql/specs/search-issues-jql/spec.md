## ADDED Requirements

### Requirement: JQL issue search tool
The system SHALL expose an MCP tool named `jira-search-issues` that accepts a JQL query string and returns matching Jira issues as a structured list.

#### Scenario: Successful search with default options
- **WHEN** a client calls `jira-search-issues` with a valid JQL string (e.g. `project = MYPROJ AND status = "In Progress"`)
- **THEN** the tool returns a JSON array of matching issues, each containing: key, summary, status, priority, issueType, assignee, reporter, labels, created, updated, and a URL to the issue

#### Scenario: Search with maxResults limit
- **WHEN** a client calls `jira-search-issues` with `maxResults` set to a value between 1 and 100
- **THEN** the tool returns at most that many issues

#### Scenario: maxResults defaults to 20
- **WHEN** a client calls `jira-search-issues` without specifying `maxResults`
- **THEN** the tool returns at most 20 issues

#### Scenario: maxResults is capped at 100
- **WHEN** a client calls `jira-search-issues` with `maxResults` greater than 100
- **THEN** the tool clamps the value to 100 and returns at most 100 issues

#### Scenario: JQL returns no results
- **WHEN** a client calls `jira-search-issues` with a JQL query that matches no issues
- **THEN** the tool returns an empty array and `total: 0`

#### Scenario: Invalid JQL string
- **WHEN** a client calls `jira-search-issues` with a malformed JQL string
- **THEN** the tool returns `success: false` with an error message from the Jira API

#### Scenario: Response includes total count
- **WHEN** a client calls `jira-search-issues` with any valid JQL query
- **THEN** the response includes a `total` field indicating how many issues match the query in Jira (may exceed the number returned)
