"use client";

import { useChat } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { Fragment, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

const ChatBotDemo = () => {
  const [input, setInput] = useState(
    "create a 10 question quiz for this presentation",
  );

  const { messages, sendMessage, status, regenerate } = useChat();

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // Log file attachments with sizes
    if (hasAttachments) {
      const fileCount = message.files?.length || 0;
      const fileInfos = await Promise.all(
        message.files?.map(async (f) => {
          try {
            const response = await fetch(f.url);
            const blob = await response.blob();
            const sizeMB = (blob.size / 1024 / 1024).toFixed(1);
            return `${f.type} (${sizeMB}MB)`;
          } catch {
            return f.type;
          }
        }) || []
      );
      Sentry.logger.info(Sentry.logger.fmt`user uploaded ${fileCount} file${fileCount === 1 ? '' : 's'}: ${fileInfos.join(', ')}`);
    }

    // Convert blob URLs to data URLs for server processing
    let processedFiles = message.files;
    if (message.files?.length) {
      processedFiles = await Promise.all(
        message.files.map(async (file) => {
          if (file.url.startsWith("blob:")) {
            try {
              const response = await fetch(file.url);
              const blob = await response.blob();
              const reader = new FileReader();
              const dataUrl = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              return { ...file, url: dataUrl };
            } catch (error) {
              console.error("Failed to convert blob URL to data URL:", error);
              Sentry.logger.error(Sentry.logger.fmt`failed to convert blob URL for file: ${file.type}`);
              return file;
            }
          }
          return file;
        }),
      );
    }

    Sentry.logger.info(Sentry.logger.fmt`sending message${hasAttachments ? ' with files' : ''}`);
    
    sendMessage({
      text: message.text || "Sent with attachments",
      files: processedFiles,
    });
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                          {message.role === "assistant" &&
                            i === messages.length - 1 && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                              </Actions>
                            )}
                        </Fragment>
                      );

                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );

                    case "tool-extract_slides":
                    case "tool-generate_questions":
                    case "tool-dedupe_questions":
                    case "tool-package_quiz":
                      return (
                        <Tool
                          key={`${message.id}-${i}`}
                          defaultOpen={
                            part.state === "output-available" ||
                            part.state === "output-error"
                          }
                        >
                          <ToolHeader type={part.type} state={part.state} />
                          <ToolContent>
                            <ToolInput input={part.input} />
                            <ToolOutput
                              output={part.output}
                              errorText={part.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
