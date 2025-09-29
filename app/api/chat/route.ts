import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
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

  // Check if there's a PDF file in the conversation
  const hasPDF = messages.some((msg) =>
    msg.parts?.some(
      (part) => part.type === "file" && part.url?.includes("application/pdf"),
    ),
  );

  const hasMoreThanOneUserMessages =
    messages.filter((msg) => msg.role === "user").length > 1;

  console.log("chat request received", { hasPDF, hasMoreThanOneUserMessages });

  if (hasPDF) {
    Sentry.logger.info("starting quiz generation workflow");
  }

  const result = streamText({
    model: openai("gpt-4o"),
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
      functionId: "chat",
    },
    messages: convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    tools: quizTools,
    stopWhen: stepCountIs(15),

    // Programmatically control tool workflow
    prepareStep: async ({ stepNumber, steps }) => {
      // Only enforce tool workflow if there's a PDF
      if (!hasPDF) return {};

      // Get tool calls from previous steps
      const allToolCalls = steps.flatMap((step) => step.toolCalls || []);
      const calledTools = new Set(allToolCalls.map((call) => call.toolName));

      // Step 0: If no tools called yet, force extract_slides
      if (
        stepNumber === 0 ||
        (!calledTools.has("extract_slides") &&
          stepNumber < 5 &&
          !hasMoreThanOneUserMessages)
      ) {
        return {
          toolChoice: { type: "tool" as const, toolName: "extract_slides" },
          activeTools: ["extract_slides"],
        };
      }

      // Step 1: After extract_slides, force generate_questions
      if (
        calledTools.has("extract_slides") &&
        !calledTools.has("generate_questions")
      ) {
        return {
          toolChoice: { type: "tool" as const, toolName: "generate_questions" },
          activeTools: ["generate_questions"],
        };
      }

      // Step 2: After generate_questions, force dedupe_questions
      if (
        calledTools.has("generate_questions") &&
        !calledTools.has("dedupe_questions")
      ) {
        return {
          toolChoice: { type: "tool" as const, toolName: "dedupe_questions" },
          activeTools: ["dedupe_questions"],
        };
      }

      // Step 3: After dedupe_questions, force package_quiz
      if (
        calledTools.has("dedupe_questions") &&
        !calledTools.has("package_quiz")
      ) {
        return {
          toolChoice: { type: "tool" as const, toolName: "package_quiz" },
          activeTools: ["package_quiz"],
        };
      }

      // After all quiz tools are done, allow normal generation
      return {};
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
