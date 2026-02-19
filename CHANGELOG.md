# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-19

### Added

- `jira-get-issue` tool to fetch existing Jira issues by key
- `mcp-inspect` script for testing with MCP Inspector

### Changed

- Jira URL is now read from the API response instead of being hardcoded

## [1.1.0] - 2026-01-25

### Added

- Support for pre-formatted ADF objects in issue descriptions
- Runtime ADF validation with Zod schemas
- `--help` / `-h` flag for quick setup reference
- `jira-ticket` command for interactive ticket creation with ADF formatting
- Biome for linting and formatting (`bun run lint`, `bun run lint:fix`)
- Unit tests for ADF schema validation
- `.editorconfig` for consistent editor settings

### Changed

- Read version from `package.json` instead of hardcoding
- Refactored codebase into separate modules (`config.ts`, `server.ts`, `help.ts`, `version.ts`, `adf-schema.ts`)

## [1.0.0] - 2026-01-24

### Added

- Initial release
- MCP server with `jira-create-issue` tool
- Support for summary, description, issue type, priority, labels, and project key
- Plain text to ADF conversion for descriptions
- Standalone executable build with Bun
- Deploy script for `~/bin` installation
- Claude Desktop, Cursor, and Claude Code integration examples
