---
name: jira-ticket
description: Draft and create a JIRA ticket (Story, Bug, or Maintenance task), or update an existing one, using the Jira MCP server
argument-hint: summary or issue key (e.g. PROJ-123)
---

# JIRA Ticket Drafter

You help draft well-structured JIRA tickets by gathering the necessary information interactively, with the option to create or update tickets directly in JIRA using the Jira MCP server.

## Pre-requisites

This command requires the **Jira MCP server** to be configured and available.

## User Input

Argument (if provided): $ARGUMENTS

## Detecting Create vs Update Mode

If $ARGUMENTS matches an issue key pattern (e.g. `PROJ-123`, `VERBU-456` — uppercase letters, a hyphen, then digits), enter **Update Mode**. Otherwise, enter **Create Mode** and treat $ARGUMENTS as the summary.

---

## Update Mode

### Step U1: Fetch the existing issue

Call `jira-get-issue` with the issue key from $ARGUMENTS.

If the API returns an error (issue not found), tell the user:
> "Issue {key} was not found. Please check the key and try again."

Then stop — do not proceed further.

### Step U2: Show current content

Display the current issue to the user:

```markdown
## {key}: {summary}

**Type:** {issueType} | **Status:** {status} | **Priority:** {priority}
**Assignee:** {assignee} | **Reporter:** {reporter}

### Description
{description rendered as readable text}
```

### Step U3: Ask what to update

Ask the user: "What would you like to change?"

Present options:
1. **Summary** — change the title
2. **Description** — rewrite the description
3. **Both** — change summary and description

For description changes, gather the new content interactively (same question flow as create mode based on the issue type, but pre-filled with existing content where possible). The user can skip fields they don't want to change.

### Step U4: Preview and confirm

Show the updated ticket as a markdown diff — display what changed. Then present options:

1. **Update in JIRA** — submit the changes
2. **Make changes** — edit the draft further
3. **Cancel** — discard changes

### Step U5: Re-fetch before submitting

Before calling `jira-update-issue`, **always** call `jira-get-issue` again with the same key to get the latest state from Jira.

Compare the freshly fetched issue against the snapshot from Step U1:

- If **summary or description changed remotely** since you first fetched it, show the user what changed:

  ```
  ⚠️ This issue was modified remotely since you started editing.

  Remote changes detected:
  - Summary: "{old}" → "{new}"   (or "unchanged")
  - Description: changed / unchanged

  Your intended changes:
  - Summary: ...
  - Description: ...

  How do you want to proceed?
  1. Apply my changes anyway (overwrite remote changes)
  2. Abort — let me review the remote changes first
  ```

  Wait for the user to choose before continuing.

- If **nothing changed remotely**, proceed silently without bothering the user.

### Step U6: Update in JIRA

1. If updating the description, construct the ADF object using the same formatting rules as create mode (see Step 5 below for ADF construction details)
2. Call `jira-update-issue` with:
   - `issueKey`: the issue key
   - `summary`: the new summary (only if changed)
   - `description`: the new ADF description (only if changed)
3. Handle the response:
   - On success: "Issue {key} updated successfully.\nView it at: {url}"
   - On error: Show the error message

---

## Create Mode

If $ARGUMENTS is provided and is not an issue key, use it as the **Summary** and skip asking for it in Step 2.

Guess from the passed summary what type of ticket it could be.
So the word `fix` sounds like a bug. If it start with `Infrastructure` it is usually a maintenance task. So you can preselect the ticket type, but always ask the user what type it should be

## Process

### Step 1: Determine Ticket Type

If not already specified, ask the user:

"What type of JIRA ticket do you want to create?

1. Story - A user story or feature request
2. Bug - Report a defect or unexpected behavior
3. Maintenance task - Technical work, refactoring, or maintenance

Choose (1-3):"

### Step 2: Gather Information Based on Type

#### For Stories:
Ask these questions (user can skip with 'skip' or '-'):
1. **Summary**: Brief description of the story (one-line)
2. **Priority**: How important is this? (High/Medium/Low)
3. **Description**: Ask the user to elaborate on the story
4. **TODO**: What tasks need to be done?
5. **Acceptance Criteria**: How do we verify it's complete?

#### For Bugs:
Ask these questions (user can skip with 'skip' or '-'):
1. **Summary**: What is the bug? (one-line description)
2. **Environment**: Where does this occur? (browser, OS, version, etc.)
3. **Steps to Reproduce**: How can someone recreate this issue?
4. **Expected Behavior**: What should happen?
5. **Actual Behavior**: What actually happens?
6. **Severity**: How critical is this? (Critical/High/Medium/Low)
7. **Screenshots/Logs**: Any additional context?
8. **TODO**: What tasks need to be done to fix it?
9. **Acceptance Criteria**: How do we verify it's fixed?

#### For Maintenance tasks:
Ask these questions (user can skip with 'skip' or '-'):
1. **Summary**: What needs to be done? (one-line description)
2. **Description**: Detailed explanation of the task
3. **Motivation**: Why is this maintenance needed?
4. **TODO**: What tasks need to be done?
5. **Acceptance Criteria**: How do we verify it's complete?
6. **Dependencies**: Are there blockers or prerequisites?
7. **Priority**: How urgent is this? (High/Medium/Low)

### Step 3: Generate the Ticket

Store the ticket data internally for API submission and format a markdown preview:

```markdown
## Summary

**Type:** Story/Bug/Maintenance task
**Priority:** High/Medium/Low
**Project:** VERBU

### Description
[Formatted description based on gathered info]

### TODO
- Todo item 1
- Todo item 2
- ...

### Acceptance Criteria
- Criterion 1
- Criterion 2
- ...

### Additional Information
[Any extra context, links, screenshots mentioned]
```

### Step 4: Present and Refine

Check for grammar errors and fix them.

Show the draft to the user as markdown, then use the AskUserQuestion tool to present these options as an interactive selection:

1. **Create in JIRA** - Submit the ticket to JIRA
2. **Make changes** - Edit specific fields in the ticket
3. **Add more details** - Provide additional information
4. **Start over** - Discard this draft and begin again

If the user wants changes, make the requested edits and show the updated version.

### Step 5: Create in JIRA (if selected)

When the user selects "Create in JIRA":

1. **Construct the Atlassian Document Format (ADF) description:**

   Build an ADF object with proper formatting for all sections:

   ```javascript
   {
     "type": "doc",
     "version": 1,
     "content": [
       // Main description paragraphs
       { "type": "paragraph", "content": [{ "type": "text", "text": "Main description here" }] },

       // Environment/context sections (for bugs)
       { "type": "paragraph", "content": [{ "type": "text", "text": "Environment: Browser, OS, etc." }] },

       // TODO section
       { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "TODO" }] },
       { "type": "panel", "attrs": { "panelType": "error" }, "content": [
         { "type": "paragraph", "content": [{ "type": "text", "text": "First task" }] }
       ]},
       { "type": "panel", "attrs": { "panelType": "error" }, "content": [
         { "type": "paragraph", "content": [{ "type": "text", "text": "Second task" }] }
       ]},

       // Acceptance Criteria section
       { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Acceptance Criteria" }] },
       { "type": "panel", "attrs": { "panelType": "error" }, "content": [
         { "type": "paragraph", "content": [{ "type": "text", "text": "First criterion" }] }
       ]},
       { "type": "panel", "attrs": { "panelType": "error" }, "content": [
         { "type": "paragraph", "content": [{ "type": "text", "text": "Second criterion" }] }
       ]}
     ]
   }
   ```

   **Panel types available:**
   - "error" (red) - Use for TODO items and Acceptance Criteria
   - "info" (blue) - For informational notes
   - "warning" (yellow) - For warnings
   - "success" (green) - For completed items
   - "note" (purple) - For general notes

   **Each TODO and Acceptance Criteria item gets its own separate panel**

2. **Use the jira-create-issue MCP tool:**

   Call the `jira-create-issue` tool with the following parameters:
   - `summary`: The ticket summary (one-line title)
   - `description`: The ADF object constructed in step 1
   - `issueType`: The mapped issue type (Story/Bug/Maintenance task)
   - `priority`: The mapped priority (Highest/High/Medium/Low)
   - `projectKey`: Use the value from `$JIRA_PROJECT` environment variable (default: "VERBU")

   The MCP server handles:
   - Authentication using `JIRA_EMAIL` and `JIRA_API_TOKEN`
   - Sending the ADF object directly to Jira API
   - Error handling

3. **Handle the response:**
   - The tool returns a JSON response with `success`, `issue`, and `message` fields
   - The `issue` object contains `id`, `key`, and `self` (the browsable URL)
   - On success: Show the issue key and URL from the response
     Example: "Issue created successfully: {key}\nView it at: {self}"
   - On error: Show the error message from the response

## Issue Type Mapping

Map the user-selected types to JIRA issue types:
- Story → "Story"
- Bug → "Bug"
- Maintenance task → "Maintenance task"

## Priority Mapping

Map priorities to JIRA priority names:
- Critical → "Highest"
- High → "High"
- Medium → "Medium"
- Low → "Low"

## Guidelines

- Keep language clear and concise
- Use bullet points for lists in the markdown preview
- Format acceptance criteria as checkboxes in markdown preview
- Include all relevant technical details
- If the user provides partial info via $ARGUMENTS, pre-fill what you can and ask only for missing details
- When constructing ADF, ensure each TODO and Acceptance Criteria item gets its own separate error panel
- The MCP server handles authentication and API communication
