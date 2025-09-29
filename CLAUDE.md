# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 multi-modal chatbot application that supports text and file uploads (images and PDFs). It integrates with OpenAI's API using the AI SDK and includes a React-based chat interface with file attachment capabilities.

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build production application with Turbopack
pnpm build

# Start production server
pnpm start

# Run linting and formatting checks
pnpm lint

# Format code automatically
pnpm format
```

## Architecture

### Core Stack
- **Framework**: Next.js 15 with App Router
- **AI Integration**: AI SDK with OpenAI provider (configured for GPT-5)
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict configuration enabled
- **Linting/Formatting**: Biome (replaces ESLint/Prettier)

### File Structure
```
app/
├── api/chat/route.ts       # Chat API endpoint using AI SDK streaming
├── layout.tsx              # Root layout with Geist fonts
├── page.tsx                # Main chat component with file upload
└── globals.css             # Tailwind CSS imports

Key files:
- biome.json                # Biome configuration for linting/formatting
- tsconfig.json             # TypeScript config with path aliases (@/*)
```

### Chat Implementation
The chat system is built with:
- **Client**: `useChat` hook from AI SDK React with custom transport
- **Server**: Streaming text responses using `streamText` from AI SDK
- **File Support**: Multi-file uploads converted to data URLs (images/PDFs)
- **UI**: Message rendering with image display and PDF iframe support

### Key Components
- **Chat Component** (`app/page.tsx:32`): Main chat interface handling user input and file uploads
- **File Conversion** (`app/page.tsx:55`): Utility function converting blob URLs to data URLs for AI processing
- **API Route** (`app/api/chat/route.ts:7`): Streaming chat endpoint with tool calling support
- **AI Tools** (`ai/tools/`): Modular quiz generation tools using AI SDK patterns

### AI Tools Architecture
The application includes AI-powered quiz generation tools:

```
ai/
├── schemas.ts              # Shared Zod schemas (Question, Quiz types)
├── index.ts                # Tool exports and quizTools collection
└── tools/
    ├── extract-slides.ts   # PDF slide extraction tool
    ├── generate-questions.ts # Question generation from slides
    ├── dedupe-questions.ts # Question deduplication logic
    └── package-quiz.ts     # Final quiz packaging tool
```

**Tool Workflow for PDF Quiz Generation:**
1. `extract_slides`: Extracts content from PDF slides
2. `generate_questions`: Creates questions from each slide
3. `dedupe_questions`: Removes similar/duplicate questions
4. `package_quiz`: Packages final 10-question quiz

All tools use the `tool` helper from AI SDK with Zod validation and are configured for multi-step execution with `stopWhen(stepCountIs(10))`.

## Development Notes

- Uses `pnpm` as package manager
- Biome handles both linting and formatting with Next.js and React recommended rules
- Path alias `@/*` maps to project root
- File uploads accept `image/*` and `application/pdf` MIME types
- OpenAI model is configured as "gpt-5" (verify model availability)
- AI tools are modular and can be imported individually or as `quizTools` collection