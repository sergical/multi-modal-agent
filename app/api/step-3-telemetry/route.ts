import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { weatherToolFixed, locationToolFixed } from "@/ai/tools/day-planner";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log("\n🔍 Starting agent with Sentry telemetry enabled...\n");
  Sentry.logger.info("day planner agent request received");

  const result = streamText({
    model: openai("gpt-4o-mini"),

    // 🎯 PRODUCTION TELEMETRY: Sentry x Vercel AI SDK Integration
    // This captures spans, inputs, and outputs per call site
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
      functionId: "day-planner-agent",
    },

    messages: convertToModelMessages(messages),
    tools: {
      weather: weatherToolFixed,
      location: locationToolFixed,
    },

    stopWhen: stepCountIs(5),

    // Same logging as before, plus Sentry integration
    onStepFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📍 Step Finished`);
      console.log(`${"=".repeat(60)}`);
      console.log(`🔢 Tokens used: ${usage?.totalTokens || 0}`);

      if (toolCalls?.length) {
        console.log(`\n🔧 Tool Calls (${toolCalls.length}):`);
        for (const tc of toolCalls) {
          const args = 'args' in tc ? tc.args : {};
          console.log(`  • ${tc.toolName}(${JSON.stringify(args)})`);

          // Log to Sentry for production monitoring
          Sentry.logger.info(
            Sentry.logger.fmt`tool called: ${tc.toolName} with args ${JSON.stringify(args)}`
          );
        }
      }

      if (toolResults?.length) {
        console.log(`\n📊 Tool Results (${toolResults.length}):`);
        for (const tr of toolResults) {
          const result = 'result' in tr ? tr.result : {};
          const resultPreview = JSON.stringify(result).slice(0, 100);
          console.log(`  • ${tr.toolName}`);
          console.log(`    Result: ${resultPreview}${resultPreview.length === 100 ? "..." : ""}`);
        }
      }

      if (text) {
        const textPreview = text.slice(0, 100);
        console.log(`\n💬 Text: ${textPreview}${textPreview.length === 100 ? "..." : ""}`);
      }

      if (finishReason) {
        console.log(`\n✅ Finish Reason: ${finishReason}`);

        // Log completion to Sentry
        Sentry.logger.info(
          Sentry.logger.fmt`day planner agent step completed with reason: ${finishReason}`
        );
      }

      console.log(`${"=".repeat(60)}\n`);
    },
  });

  return result.toUIMessageStreamResponse();
}

