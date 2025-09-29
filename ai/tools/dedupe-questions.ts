import { tool } from "ai";
import { z } from "zod";
import { QuestionSchema } from "../schemas";

export const dedupeQuestionsTool = tool({
  description: "Remove duplicate or similar questions from a list",
  inputSchema: z.object({
    questions: z
      .array(QuestionSchema)
      .describe("Array of questions to deduplicate"),
  }),
  execute: async ({ questions }) => {
    const unique = [];
    const seenQuestions = new Set<string>();

    for (const question of questions) {
      // Simple normalized text for duplicate detection
      const normalized = question.question
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!seenQuestions.has(normalized)) {
        seenQuestions.add(normalized);
        unique.push(question);
      }
    }

    return { questions: unique };
  },
});
