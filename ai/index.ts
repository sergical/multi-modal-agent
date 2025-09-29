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

export const SYSTEM_PROMPT = `You are a helpful assistant that can answer questions and help with tasks.

If a PDF is present in the conversation, use the available tools to:
1. Extract slides from the PDF content using extract_slides
2. Generate questions for each slide using generate_questions  
3. Deduplicate any similar questions using dedupe_questions
4. Package the final quiz with exactly 10 questions using package_quiz

Always follow this workflow when processing PDFs to create comprehensive quizzes.`;
