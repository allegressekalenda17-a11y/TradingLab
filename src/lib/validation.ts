import { z } from 'zod';

// Prediction request validation
export const PredictionRequestSchema = z.object({
  ticks: z.array(z.number().min(0).max(9)).min(1).max(1000),
  strategy: z.enum(['matches', 'under', 'over', 'differs']),
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

// Gemini API request validation
export const GeminiRequestSchema = z.object({
  prompt: z.string().min(1).max(5000),
  model: z.string().default('gemini-3-flash-preview'),
  config: z.record(z.any()).optional(),
});

export type GeminiRequest = z.infer<typeof GeminiRequestSchema>;

// Validation middleware helper
export const validateRequest = <T>(schema: z.Schema<T>, data: any): { valid: true; data: T } | { valid: false; error: string } => {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    return { valid: false, error: 'Validation failed' };
  }
};
