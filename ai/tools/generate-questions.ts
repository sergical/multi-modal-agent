import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import { QuestionSchema } from "../schemas";

export const generateQuestionsTool = tool({
  description: "Generate multiple-choice quiz questions from slide content",
  inputSchema: z.object({
    slide: z.string().describe("Slide content to generate questions from"),
  }),
  execute: async ({ slide }) => {
    const result = await generateObject({
      model: openai("gpt-5-mini"),
      schema: z.object({
        questions: z.array(QuestionSchema.omit({ id: true })),
      }),
      prompt: `Generate 2-3 multiple-choice quiz questions from this slide content: "${slide}"

Each question must have exactly 4 options and test understanding of key concepts.
Make sure one option is clearly correct and the others are plausible distractors.
Vary difficulty levels (easy, medium, hard).`,
    });

    // Add IDs to each question
    const questions = result.object.questions.map((q) => ({
      ...q,
      id: nanoid(),
    }));

    return { questions };
  },
});
