import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { quizTools } from "@/ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: UIMessage[];
  } = await req.json();

  const result = streamText({
    model: openai("gpt-5"),
    messages: convertToModelMessages(messages),
    system: `You are a helpful assistant that can answer questions and help with tasks.

If a PDF is present in the conversation, use the available tools to:
1. Extract slides from the PDF content using extract_slides
2. Generate questions for each slide using generate_questions  
3. Deduplicate any similar questions using dedupe_questions
4. Package the final quiz with exactly 10 questions using package_quiz

Always follow this workflow when processing PDFs to create comprehensive quizzes.`,
    tools: quizTools,
    stopWhen: stepCountIs(1),
  });

  return result.toUIMessageStreamResponse();
}
