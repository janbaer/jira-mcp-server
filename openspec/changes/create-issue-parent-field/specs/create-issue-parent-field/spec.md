## ADDED Requirements

### Requirement: Optional parent issue on create
The `jira-create-issue` tool SHALL accept an optional `parentKey` parameter. When provided, the created issue SHALL be linked as a child of the specified parent.

#### Scenario: Issue created with parent
- **WHEN** a client calls `jira-create-issue` with a valid `parentKey` (e.g. `"PROJ-10"`)
- **THEN** the Jira API request includes `fields.parent.key` set to that value and the issue is created as a child

#### Scenario: Issue created without parent
- **WHEN** a client calls `jira-create-issue` without `parentKey`
- **THEN** the request body contains no `parent` field and the issue is created as a top-level issue

#### Scenario: Invalid parent key
- **WHEN** a client calls `jira-create-issue` with a `parentKey` that does not exist in Jira
- **THEN** the tool returns `success: false` with the error message from the Jira API
