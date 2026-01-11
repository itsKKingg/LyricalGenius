import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL',
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
  }),
  NEXT_PUBLIC_USE_MOCKS: z.string().optional(),
});

const serverEnvSchema = clientEnvSchema.extend({
  GROQ_API_KEY: z.string().min(1, {
    message: 'GROQ_API_KEY is required',
  }),
  PEXELS_API_KEY: z.string().min(1, {
    message: 'PEXELS_API_KEY is required',
  }),
  HUGGINGFACE_API_KEY: z.string().optional(),
});

const formatZodError = (error) =>
  error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');

const parseEnv = (schema, values) => {
  try {
    return schema.parse(values);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Environment variable validation failed:\n\n${formatZodError(error)}\n\nPlease check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
};

const clientValues = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
};

const isServer = typeof window === 'undefined';

export const env = isServer
  ? parseEnv(serverEnvSchema, {
      ...clientValues,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      PEXELS_API_KEY: process.env.PEXELS_API_KEY,
      HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    })
  : parseEnv(clientEnvSchema, clientValues);
