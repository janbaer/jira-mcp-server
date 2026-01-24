#!/usr/bin/env bun
import { JiraClient } from "./jira-client.js";
import { getConfig } from "./config.js";
import { showHelp } from "./help.js";
import { createMcpServer, startServer } from "./server.js";

async function main(): Promise<void> {
  const config = getConfig();
  const jiraClient = new JiraClient(config);
  const server = createMcpServer(config, jiraClient);
  await startServer(server);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
