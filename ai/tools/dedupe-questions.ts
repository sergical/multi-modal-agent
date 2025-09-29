import { tool } from "ai";
import { z } from "zod";
import { QuestionSchema } from "../schemas";
import * as Sentry from "@sentry/nextjs";

export const dedupeQuestionsTool = tool({
  description: "Remove duplicate or similar questions from a list",
  inputSchema: z.object({
    questions: z
      .array(QuestionSchema)
      .describe("Array of questions to deduplicate"),
  }),
  execute: async ({ questions }) => {
    const initialCount = questions.length;
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

    const duplicatesRemoved = initialCount - unique.length;
    
    if (duplicatesRemoved > 0) {
      Sentry.logger.info(Sentry.logger.fmt`dedupe removed ${duplicatesRemoved} duplicate${duplicatesRemoved === 1 ? '' : 's'}`);
    } else {
      Sentry.logger.info("dedupe found no duplicates");
    }

    return { questions: unique };
  },
});
