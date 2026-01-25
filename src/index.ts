#!/usr/bin/env bun
import { getConfig } from "./config";
import { showHelp } from "./help";
import { JiraClient } from "./jira-client";
import { createMcpServer, startServer } from "./server";

async function main(): Promise<void> {
  const config = getConfig();
  const jiraClient = new JiraClient(config);
  const server = createMcpServer(config, jiraClient);
  await startServer(server);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
