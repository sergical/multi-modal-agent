# Day Planner Agent Debugging Demo

This is a live demonstration app for the talk: **"How Do I Fix the Robot? Local Debugging for Vercel AI SDK Agents"**

## Demo Overview

This app demonstrates progressive debugging techniques for Vercel AI SDK agents through 4 stages, from a broken agent to production-ready monitoring.

## Demo Flow

### Step 0: Broken Agent
**Route:** `/api/step-0-broken`

A minimal Next.js agent with buggy `weather()` and `location()` tools:
- **Weather Bug:** Returns wrong shape `{temp: "72°F", conditions: "sunny"}` instead of `{temperature: number, unit: string, conditions: string}`
- **Location Bug:** Missing timezone field, wrong field names
- **No logging** - when it breaks, you have no visibility

### Step 1: Add Logging
**Route:** `/api/step-1-logging`

Same broken tools, but now with comprehensive logging:
- `onStepFinish` callback logs each step's execution
- `stopWhen(stepCountIs(5))` prevents runaway loops

**Console output shows:**
- Token usage
- Tool calls with arguments
- Tool results with preview
- Clear visibility into what's happening

### Step 2: Fixed Tools
**Route:** `/api/step-2-fixed`

Corrected tools with same logging:
- Fixed: Returns correct shape matching schema
- Fixed: Validates location parameter
- Console shows clean, successful execution

### Step 3: Production Telemetry
**Route:** `/api/step-3-telemetry`

Production-ready with Sentry integration:
- `experimental_telemetry` configuration
- Sentry × Vercel AI SDK captures spans/inputs/outputs
- Ready for production monitoring

## Running the Demo

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Key Files

### API Routes
- `app/api/step-0-broken/route.ts` - Minimal broken agent
- `app/api/step-1-logging/route.ts` - Added onStepFinish logging
- `app/api/step-2-fixed/route.ts` - Fixed tools with logging
- `app/api/step-3-telemetry/route.ts` - Production telemetry

### Tools
- `ai/tools/day-planner.ts` - Contains broken and fixed weather + location tools

### Frontend
- `app/page.tsx` - Simple landing page with chat interface

## Testing the Demo

Try these prompts:
- "What's the weather in San Francisco?"
- "What timezone is New York in?"
- "Tell me about the weather in Miami"

Watch the console output in each step to see:
- **Step 0:** Silent failure or unexpected behavior
- **Step 1:** Detailed logs showing the bugs
- **Step 2:** Clean execution with correct results
- **Step 3:** Production telemetry in action

## Key Takeaways

1. **Built-in visibility:** Use `onStepFinish` for local debugging
2. **Control the loop:** Use `stopWhen` to constrain agent behavior
3. **Tool I/O matters:** Define tools with proper schemas so bugs fail loudly
4. **Production monitoring:** Enable telemetry for production observability

## Technologies

- Next.js 15
- Vercel AI SDK
- OpenAI GPT-4o-mini
- Sentry (telemetry)
- TypeScript
- Tailwind CSS
