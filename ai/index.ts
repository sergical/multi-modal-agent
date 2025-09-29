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

When working with PDF files to create quizzes, use the available tools to:
- Extract slide content from PDFs 
- Generate comprehensive quiz questions
- Create well-structured quizzes

The tool workflow is automatically managed, so focus on providing helpful responses and context around the quiz generation process.`;
