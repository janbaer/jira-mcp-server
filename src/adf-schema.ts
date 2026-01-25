import { z } from "zod";

/**
 * Atlassian Document Format (ADF) Schema Definitions
 *
 * Provides runtime validation for ADF structures used in Jira descriptions.
 * Based on: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 */

// Text marks (bold, italic, etc.)
const textMarkSchema = z.object({
  type: z.enum(["strong", "em", "code", "link", "strike", "underline", "subsup"]),
  attrs: z.record(z.any()).optional(),
});

// Base text node
const textNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z.array(textMarkSchema).optional(),
});

// Paragraph node
const paragraphNodeSchema = z.object({
  type: z.literal("paragraph"),
  content: z.array(textNodeSchema).optional(),
});

// Heading node (H1-H6)
const headingNodeSchema = z.object({
  type: z.literal("heading"),
  attrs: z.object({
    level: z.number().min(1).max(6),
  }),
  content: z.array(textNodeSchema),
});

// Panel node (colored info boxes)
const panelNodeSchema = z.object({
  type: z.literal("panel"),
  attrs: z.object({
    panelType: z.enum(["info", "note", "warning", "success", "error"]),
  }),
  content: z.array(paragraphNodeSchema),
});

// List item node
const listItemNodeSchema = z.object({
  type: z.literal("listItem"),
  content: z.array(paragraphNodeSchema),
});

// Bullet list node
const bulletListNodeSchema = z.object({
  type: z.literal("bulletList"),
  content: z.array(listItemNodeSchema),
});

// Ordered list node
const orderedListNodeSchema = z.object({
  type: z.literal("orderedList"),
  content: z.array(listItemNodeSchema),
});

// Code block node
const codeBlockNodeSchema = z.object({
  type: z.literal("codeBlock"),
  attrs: z.object({
    language: z.string().optional(),
  }).optional(),
  content: z.array(textNodeSchema).optional(),
});

// Union of all supported ADF node types
const adfNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    paragraphNodeSchema,
    headingNodeSchema,
    panelNodeSchema,
    bulletListNodeSchema,
    orderedListNodeSchema,
    codeBlockNodeSchema,
  ])
);

// Complete ADF document schema
export const adfSchema = z.object({
  type: z.literal("doc"),
  version: z.literal(1),
  content: z.array(adfNodeSchema),
});

// Export TypeScript type inferred from schema
export type AdfDocument = z.infer<typeof adfSchema>;

// Helper to validate ADF at runtime
export function validateAdf(data: unknown): AdfDocument {
  return adfSchema.parse(data);
}

// Helper to check if data is valid ADF without throwing
export function isValidAdf(data: unknown): data is AdfDocument {
  return adfSchema.safeParse(data).success;
}
