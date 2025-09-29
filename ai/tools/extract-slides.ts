import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
import { z } from "zod";

export const extractSlidesTool = tool({
  description:
    "Extract slide content from PDF that was uploaded in the conversation",
  inputSchema: z.object({}),
  execute: async (_, { messages }) => {
    // Find the PDF file in the conversation messages
    let pdfFile: any = null;

    for (const msg of messages) {
      if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === "file" && part.mediaType === "application/pdf") {
            pdfFile = part;
            break;
          }
        }
      }
      if (pdfFile) break;
    }

    if (!pdfFile) {
      throw new Error("No PDF file found in the conversation");
    }

    // Use structured output to get reliable JSON
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        slides: z.array(z.string()).describe("Array of slide content strings"),
      }),
      messages: [
        {
          role: "system",
          content:
            "Extract the main content from each slide in the PDF. Return a JSON object with an array of strings, where each string contains the key information from one slide.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract the content from each slide in this PDF.",
            },
            {
              type: "file",
              data: pdfFile.data,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
    });

    return { slides: result.object.slides };
  },
});
