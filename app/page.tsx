"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { Fragment, useState } from "react";
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
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

const DayPlanner = () => {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/step-0-broken",
    }),
  });

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text) return;
    sendMessage({ text: message.text });
    setInput("");
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col">
      {/* Minimal Hero */}
      <div className="border-b bg-background px-6 py-6">
        <div className="space-y-0.5">
          <h1 className="font-semibold text-xl tracking-tight">Day Planner</h1>
          <p className="text-muted-foreground text-xs">
            Your personal assistant for weather and location information
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Conversation className="flex-1">
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
                            i === message.parts.length - 1 && (
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

                    case "tool-weather":
                    case "tool-location":
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

            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center px-6">
                <div className="w-full max-w-md space-y-6">
                  <div className="space-y-1 text-center">
                    <p className="text-muted-foreground text-sm">
                      Ask me about weather or locations to help plan your day
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInput("What's the weather in San Francisco?");
                      }}
                      className="rounded-lg border bg-background px-4 py-2.5 text-left text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
                    >
                      What's the weather in San Francisco?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInput("What timezone is New York in?");
                      }}
                      className="rounded-lg border bg-background px-4 py-2.5 text-left text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
                    >
                      What timezone is New York in?
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t bg-background p-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Ask about weather or location..."
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools />
              <PromptInputSubmit disabled={!input} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default DayPlanner;
