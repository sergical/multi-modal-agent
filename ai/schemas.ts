import { z } from "zod";

// Question schema
export const QuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.literal('multiple_choice'),
  options: z.array(z.string()).length(4), // Always 4 options for multiple choice
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Quiz schema
export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(QuestionSchema),
  totalQuestions: z.number(),
  estimatedTime: z.string(),
});

// Type exports
export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;