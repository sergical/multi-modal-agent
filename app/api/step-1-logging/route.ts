import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { weatherToolBroken, locationToolBroken } from "@/ai/tools/day-planner";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log("\n🚀 Starting agent with logging enabled...\n");

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
    tools: {
      weather: weatherToolBroken,
      location: locationToolBroken,
    },

    // Add stopWhen to prevent runaway loops
    stopWhen: stepCountIs(5),

    // Log every step as it completes
    onStepFinish: async ({
      text,
      toolCalls,
      toolResults,
      finishReason,
      usage,
    }) => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📍 Step Finished`);
      console.log(`${"=".repeat(60)}`);
      console.log(`🔢 Tokens used: ${usage?.totalTokens || 0}`);

      if (toolCalls?.length) {
        console.log(`\n🔧 Tool Calls (${toolCalls.length}):`);
        for (const tc of toolCalls) {
          const args = "args" in tc ? tc.args : {};
          console.log(`  • ${tc.toolName}(${JSON.stringify(args)})`);
        }
      }

      if (toolResults?.length) {
        console.log(`\n📊 Tool Results (${toolResults.length}):`);
        for (const tr of toolResults) {
          const result = "result" in tr ? tr.result : {};
          const resultPreview = JSON.stringify(result).slice(0, 100);
          console.log(`  • ${tr.toolName}`);
          console.log(
            `    Result: ${resultPreview}${
              resultPreview.length === 100 ? "..." : ""
            }`
          );
        }
      }

      if (text) {
        const textPreview = text.slice(0, 100);
        console.log(
          `\n💬 Text: ${textPreview}${textPreview.length === 100 ? "..." : ""}`
        );
      }

      if (finishReason) {
        console.log(`\n✅ Finish Reason: ${finishReason}`);
      }

      console.log(`${"=".repeat(60)}\n`);
    },
  });

  return result.toUIMessageStreamResponse();
}
