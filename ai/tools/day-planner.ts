import { tool } from "ai";
import { z } from "zod";

// BROKEN VERSION - Returns wrong shape
export const weatherToolBroken = tool({
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The city and state, e.g., San Francisco, CA"),
  }),
  execute: async ({ location: _location }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // BUG: Returns wrong shape - "temp" instead of "temperature", string instead of number
    return {
      temp: "72°F",
      conditions: "sunny",
    };
  },
});

// FIXED VERSION - Returns correct shape
export const weatherToolFixed = tool({
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The city and state, e.g., San Francisco, CA"),
  }),
  execute: async ({ location }) => {
    if (!location || location.trim() === "") {
      throw new Error("Location is required");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockWeather: Record<string, { temperature: number; unit: "celsius" | "fahrenheit"; conditions: string }> = {
      "san francisco": { temperature: 65, unit: "fahrenheit", conditions: "foggy" },
      "new york": { temperature: 55, unit: "fahrenheit", conditions: "cloudy" },
      "miami": { temperature: 85, unit: "fahrenheit", conditions: "partly cloudy" },
      default: { temperature: 72, unit: "fahrenheit", conditions: "sunny" },
    };

    const locationKey = location.toLowerCase().split(",")[0].trim();
    return mockWeather[locationKey] || mockWeather.default;
  },
});

// BROKEN VERSION - Missing location handling
export const locationToolBroken = tool({
  description: "Get location information and timezone",
  inputSchema: z.object({
    location: z.string().describe("The city name"),
  }),
  execute: async ({ location: _location }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // BUG: Returns wrong shape - missing timezone, wrong field names
    return {
      city: "San Francisco",
      state: "CA",
    };
  },
});

// FIXED VERSION
export const locationToolFixed = tool({
  description: "Get location information and timezone",
  inputSchema: z.object({
    location: z.string().describe("The city name"),
  }),
  execute: async ({ location }) => {
    if (!location || location.trim() === "") {
      throw new Error("Location is required");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockLocations: Record<string, { city: string; state: string; timezone: string }> = {
      "san francisco": { city: "San Francisco", state: "CA", timezone: "America/Los_Angeles" },
      "new york": { city: "New York", state: "NY", timezone: "America/New_York" },
      "miami": { city: "Miami", state: "FL", timezone: "America/New_York" },
      default: { city: "San Francisco", state: "CA", timezone: "America/Los_Angeles" },
    };

    const locationKey = location.toLowerCase().split(",")[0].trim();
    return mockLocations[locationKey] || mockLocations.default;
  },
});


