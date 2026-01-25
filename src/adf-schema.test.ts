import { describe, expect, test } from "bun:test";
import { isValidAdf, validateAdf } from "./adf-schema";

describe("ADF Schema Validation", () => {
  describe("Valid ADF Documents", () => {
    test("should validate simple paragraph", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Hello world",
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate heading", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [
              {
                type: "text",
                text: "TODO",
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate error panel (for TODO items)", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "panel",
            attrs: { panelType: "error" },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "First task",
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate all panel types", () => {
      const panelTypes = [
        "info",
        "note",
        "warning",
        "success",
        "error",
      ] as const;

      panelTypes.forEach((panelType) => {
        const adf = {
          type: "doc",
          version: 1,
          content: [
            {
              type: "panel",
              attrs: { panelType },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Panel content" }],
                },
              ],
            },
          ],
        };

        expect(isValidAdf(adf)).toBe(true);
      });
    });

    test("should validate bullet list", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Item 1" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Item 2" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate ordered list", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "orderedList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Step 1" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate code block", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "codeBlock",
            attrs: { language: "javascript" },
            content: [
              {
                type: "text",
                text: "const x = 42;",
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate complex document with multiple node types", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Main description" }],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "TODO" }],
          },
          {
            type: "panel",
            attrs: { panelType: "error" },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Implement feature" }],
              },
            ],
          },
          {
            type: "panel",
            attrs: { panelType: "error" },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Deploy feature" }],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Acceptance Criteria" }],
          },
          {
            type: "panel",
            attrs: { panelType: "error" },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Feature works as expected" }],
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
      expect(() => validateAdf(adf)).not.toThrow();
    });

    test("should validate empty paragraph", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
    });
  });

  describe("Invalid ADF Documents", () => {
    test("should reject wrong document type", () => {
      const invalidAdf = {
        type: "document", // should be "doc"
        version: 1,
        content: [],
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow();
    });

    test("should reject wrong version", () => {
      const invalidAdf = {
        type: "doc",
        version: 2, // should be 1
        content: [],
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow();
    });

    test("should reject invalid panel type", () => {
      const invalidAdf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "panel",
            attrs: { panelType: "danger" }, // not a valid panel type
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Test" }],
              },
            ],
          },
        ],
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow(/panelType/);
    });

    test("should reject heading with invalid level", () => {
      const invalidAdf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            attrs: { level: 7 }, // max is 6
            content: [{ type: "text", text: "Invalid heading" }],
          },
        ],
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow();
    });

    test("should reject heading with level 0", () => {
      const invalidAdf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            attrs: { level: 0 }, // min is 1
            content: [{ type: "text", text: "Invalid heading" }],
          },
        ],
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow();
    });

    test("should reject malformed text node", () => {
      const invalidAdf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                // missing 'text' field
              },
            ],
          },
        ],
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow();
    });

    test("should reject missing content array", () => {
      const invalidAdf = {
        type: "doc",
        version: 1,
        // missing content array
      };

      expect(isValidAdf(invalidAdf)).toBe(false);
      expect(() => validateAdf(invalidAdf)).toThrow();
    });

    test("should reject non-object input", () => {
      expect(isValidAdf("not an object")).toBe(false);
      expect(isValidAdf(null)).toBe(false);
      expect(isValidAdf(undefined)).toBe(false);
      expect(isValidAdf(123)).toBe(false);
      expect(isValidAdf([])).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("should validate empty content array", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [],
      };

      expect(isValidAdf(adf)).toBe(true);
    });

    test("should validate text with marks", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Bold text",
                marks: [{ type: "strong" }],
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
    });

    test("should handle text node without optional marks", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Plain text",
                // no marks field
              },
            ],
          },
        ],
      };

      expect(isValidAdf(adf)).toBe(true);
    });
  });
});
