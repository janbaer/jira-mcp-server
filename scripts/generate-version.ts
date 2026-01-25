#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "fs";

// Read version from package.json
const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));

// Generate version.ts file
const versionFileContent = `// Auto-generated file - do not edit manually
// Run 'bun run scripts/generate-version.ts' to regenerate
export const VERSION = "${packageJson.version}";
`;

writeFileSync("src/version.ts", versionFileContent);

console.log(`Generated src/version.ts with version ${packageJson.version}`);
