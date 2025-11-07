// Export all schemas
export * from "./schemas";

// Export day planner tools
import {
  weatherToolBroken,
  weatherToolFixed,
  locationToolBroken,
  locationToolFixed,
} from "./tools/day-planner";

export const dayPlannerTools = {
  weather: {
    broken: weatherToolBroken,
    fixed: weatherToolFixed,
  },
  location: {
    broken: locationToolBroken,
    fixed: locationToolFixed,
  },
} as const;

export const SYSTEM_PROMPT = `You are a helpful personal day planner assistant. When users ask about weather or locations, use the appropriate tools to help them plan their day.

Be conversational and helpful in your responses.`;
