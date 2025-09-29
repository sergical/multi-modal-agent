// Export all schemas
export * from "./schemas";

import { dedupeQuestionsTool } from "./tools/dedupe-questions";
// Export all tools
import { extractSlidesTool } from "./tools/extract-slides";
import { generateQuestionsTool } from "./tools/generate-questions";
import { packageQuizTool } from "./tools/package-quiz";

// Export tool set for easy use
export const quizTools = {
  extract_slides: extractSlidesTool,
  generate_questions: generateQuestionsTool,
  dedupe_questions: dedupeQuestionsTool,
  package_quiz: packageQuizTool,
} as const;
