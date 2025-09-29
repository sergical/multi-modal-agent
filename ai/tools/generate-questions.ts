import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import { QuestionSchema } from "../schemas";

export const generateQuestionsTool = tool({
  description: "Generate multiple-choice quiz questions from all slide content",
  inputSchema: z.object({
    slides: z
      .array(z.string())
      .describe("Array of slide content to generate questions from"),
  }),
  execute: async ({ slides }) => {
    const result = await generateObject({
      model: openai("gpt-5-mini"),
      schema: z.object({
        questions: z.array(QuestionSchema.omit({ id: true })),
      }),
      prompt: `Generate 15-20 multiple-choice quiz questions from this presentation content:

${slides.map((slide, i) => `Slide ${i + 1}: ${slide}`).join("\n\n")}

Requirements:
- Each question must have exactly 4 options
- Test understanding of key concepts across all slides
- One option should be clearly correct, others should be plausible distractors
- Vary difficulty levels (easy, medium, hard)
- Cover different slides but focus on the most important concepts
- Generate more questions than needed so deduplication can select the best ones`,
    });

    // Add IDs to each question
    const questions = result.object.questions.map((q) => ({
      ...q,
      id: nanoid(),
    }));

    return { questions };
  },
});
