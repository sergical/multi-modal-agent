# AI SDK Agent Lifecycle & Debugging Options

## Complete Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    streamText() Called                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Configuration Options:                                    │  │
│  │ • model: openai("gpt-4o-mini")                          │  │
│  │ • messages: convertToModelMessages(messages)              │  │
│  │ • tools: { weather, location }                           │  │
│  │ • stopWhen: stepCountIs(5)  ← CONTROL                    │  │
│  │ • prepareStep: async ({ stepNumber, steps }) => {...}    │  │
│  │ • onStepFinish: async ({ ... }) => {...}  ← MONITOR      │  │
│  │ • experimental_telemetry: {...}  ← PRODUCTION            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 0: Initial Generation                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ prepareStep({ stepNumber: 0, steps: [] })                │  │
│  │   → Can return:                                           │  │
│  │     • toolChoice: { type: "tool", toolName: "weather" }  │  │
│  │     • activeTools: ["weather"]                            │  │
│  │     • system: "Custom system message"                     │  │
│  │     • maxSteps: 10                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Model Generates Response / Tool Calls              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Model decides:                                            │  │
│  │ • Generate text                                           │  │
│  │ • Call tool(s)                                            │  │
│  │ • Finish                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   Text Generated  │  │  Tool Calls Made  │
        └──────────────────┘  └──────────────────┘
                    │               │
                    │               ▼
                    │   ┌──────────────────────────┐
                    │   │  Tool Execution          │
                    │   │  ┌────────────────────┐  │
                    │   │  │ tool.execute()     │  │
                    │   │  │ • Input validation  │  │
                    │   │  │ • Execute logic     │  │
                    │   │  │ • Return result     │  │
                    │   │  └────────────────────┘  │
                    │   └──────────────────────────┘
                    │               │
                    └───────┬───────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP FINISHED                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ onStepFinish({                                            │  │
│  │   text: string,              ← Generated text             │  │
│  │   toolCalls: [...],          ← Tool calls made           │  │
│  │   toolResults: [...],        ← Tool execution results    │  │
│  │   finishReason: string,      ← Why step finished         │  │
│  │   usage: {                    ← Token usage              │  │
│  │     promptTokens: number,                                 │  │
│  │     completionTokens: number,                             │  │
│  │     totalTokens: number                                  │  │
│  │   }                                                       │  │
│  │ })                                                        │  │
│  │                                                           │  │
│  │ LOGGING EXAMPLES:                                        │  │
│  │ console.log(`Step finished`)                             │  │
│  │ console.log(`Tokens: ${usage.totalTokens}`)              │  │
│  │ console.log(`Tool Calls:`, toolCalls)                   │  │
│  │ console.log(`Tool Results:`, toolResults)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   More Steps?     │  │   Finished?      │
        │   (check stopWhen)│  │   (finishReason) │
        └──────────────────┘  └──────────────────┘
                    │               │
                    │               ▼
                    │   ┌──────────────────────────┐
                    │   │  Final Result            │
                    │   │  ┌────────────────────┐  │
                    │   │  │ result.steps       │  │
                    │   │  │ result.usage       │  │
                    │   │  │ result.finishReason│  │
                    │   │  │ result.text        │  │
                    │   │  └────────────────────┘  │
                    │   └──────────────────────────┘
                    │               │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Stream to UI  │
                    │ (toUIMessage  │
                    │ StreamResponse)│
                    └───────────────┘
```

## Key Options Reference

### 1. **stopWhen** - Control Loop Termination
```typescript
stopWhen: stepCountIs(5)  // Stop after 5 steps
stopWhen: ({ steps }) => steps.length >= 10  // Custom condition
```

### 2. **prepareStep** - Control Each Step
```typescript
prepareStep: async ({ stepNumber, steps }) => {
  // Access previous steps
  const previousToolCalls = steps.flatMap(s => s.toolCalls || []);

  // Control what happens next
  return {
    toolChoice: { type: "tool", toolName: "weather" },  // Force tool
    activeTools: ["weather"],  // Limit available tools
    system: "New system message",  // Override system prompt
    maxSteps: 10,  // Limit steps
  };
}
```

### 3. **onStepFinish** - Monitor Each Step
```typescript
onStepFinish: async ({
  text,           // Generated text in this step
  toolCalls,      // Array of tool calls made
  toolResults,    // Array of tool execution results
  finishReason,   // "stop" | "length" | "tool-calls" | "error"
  usage           // Token usage stats
}) => {
  // Logging
  console.log(`Step finished: ${stepNumber}`);
  console.log(`Tokens: ${usage.totalTokens}`);

  // Tool call details
  toolCalls.forEach(tc => {
    console.log(`Tool: ${tc.toolName}`);
    console.log(`Args:`, tc.args);  // Type-safe access
  });

  // Tool result details
  toolResults.forEach(tr => {
    console.log(`Result: ${tr.result}`);  // Type-safe access
  });
}
```

### 4. **experimental_telemetry** - Production Monitoring
```typescript
experimental_telemetry: {
  isEnabled: true,
  recordInputs: true,      // Record tool inputs
  recordOutputs: true,     // Record tool outputs
  functionId: "day-planner-agent"  // Identify in Sentry
}
```

### 5. **Access Final Result** - After Streaming
```typescript
const result = streamText({ ... });

// After stream completes
result.then((finalResult) => {
  console.log(`Total steps: ${finalResult.steps.length}`);
  console.log(`Total tokens: ${finalResult.usage.totalTokens}`);
  console.log(`Finish reason: ${finalResult.finishReason}`);

  // Reconstruct full flow
  finalResult.steps.forEach((step, idx) => {
    console.log(`Step ${idx}:`, step.toolCalls, step.text);
  });
});
```

## Tool Call Structure

```
toolCalls: [
  {
    toolCallId: "call_abc123",
    toolName: "weather",
    args: { location: "San Francisco" }  // Type-safe based on tool schema
  }
]

toolResults: [
  {
    toolCallId: "call_abc123",
    toolName: "weather",
    result: { temperature: 65, ... },  // Type-safe based on tool return
    state: "output-available" | "output-error"
  }
]
```

## Debugging Checklist

✅ **Visibility**
- [ ] Add `onStepFinish` to log each step
- [ ] Log `toolCalls` to see what tools are called
- [ ] Log `toolResults` to see tool outputs
- [ ] Log `usage` to track token consumption

✅ **Control**
- [ ] Use `stopWhen` to prevent runaway loops
- [ ] Use `prepareStep` to control tool selection
- [ ] Use `activeTools` to limit available tools

✅ **Production**
- [ ] Enable `experimental_telemetry` for Sentry
- [ ] Set `functionId` for identification
- [ ] Access `result.steps` after completion for analysis

