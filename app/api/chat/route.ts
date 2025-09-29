import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { quizTools, SYSTEM_PROMPT } from "@/ai";

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
    system: SYSTEM_PROMPT,
    tools: quizTools,
    stopWhen: stepCountIs(1),
  });

  return result.toUIMessageStreamResponse();
}
