import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { weatherToolBroken, locationToolBroken } from "@/ai/tools/day-planner";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
    tools: {
      weather: weatherToolBroken,
      location: locationToolBroken,
    },
  });

  return result.toUIMessageStreamResponse();
}
