import { tool } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import { QuestionSchema } from "../schemas";

export const packageQuizTool = tool({
  description:
    "Package questions into final quiz format with exactly 10 questions",
  inputSchema: z.object({
    questions: z
      .array(QuestionSchema)
      .describe("Array of questions to package into quiz"),
  }),
  execute: async ({ questions }) => {
    // Select up to 10 questions with some variety in difficulty
    const selectedQuestions = selectQuestions(questions, 10);

    const quiz = {
      id: nanoid(),
      title: "PDF Quiz",
      description: "Quiz generated from uploaded PDF content",
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      estimatedTime: `${Math.ceil(selectedQuestions.length * 1.5)} minutes`,
    };

    return { quiz };
  },
});

function selectQuestions(questions: any[], maxCount: number) {
  if (questions.length <= maxCount) {
    return questions;
  }

  // Simple selection: try to get variety by shuffling and taking first maxCount
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxCount);
}
