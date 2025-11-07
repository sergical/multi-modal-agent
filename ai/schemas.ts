import { z } from "zod";

// Planning-related schemas for the demo

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  estimatedHours: z.number(),
});

export const PlanSchema = z.object({
  tasks: z.array(TaskSchema),
  totalHours: z.number(),
});

export type Task = z.infer<typeof TaskSchema>;
export type Plan = z.infer<typeof PlanSchema>;
