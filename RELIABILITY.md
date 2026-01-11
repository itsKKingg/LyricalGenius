# Reliability Patterns

This document describes the global safety and validation patterns implemented to prevent "silent failures" in the application.

## 1. Environment Variable Validation

**File:** `src/env.mjs`

All required environment variables are validated at application startup using Zod. The app will throw a descriptive error immediately if any key is missing.

### Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (must be a valid URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GROQ_API_KEY` - Groq API key for AI functionality
- `PEXELS_API_KEY` - Pexels API key for media assets

### Usage

The env module is automatically imported during application initialization via Next.js instrumentation hooks. Simply import validated environment variables:

```typescript
import { env } from '@/env.mjs';

// Use validated env vars
const apiKey = env.GROQ_API_KEY;
```

## 2. Global Error Boundaries

**Files:** 
- `src/app/error.tsx` - Route segment error boundary
- `src/app/global-error.tsx` - Global application error boundary

Both error boundaries provide:
- User-friendly error display
- Error logging to console
- "Retry" button that clears all local caches (localStorage, sessionStorage, Cache API)
- Error digest display (when available)

### Cache Clearing Strategy

When the retry button is clicked, the following caches are cleared:
1. `localStorage`
2. `sessionStorage`
3. Browser Cache API (service worker caches)

This ensures a fresh start when recovering from errors.

## 3. Standardized Response Types

**File:** `src/types/responses.ts`

All Server Actions must return a `Result<T>` type:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number };
```

### Helper Functions

```typescript
import { success, error } from '@/types/responses';

// Success case
return success({ userId: '123', name: 'John' });

// Error case
return error('User not found', 404);
```

### Example Server Action

```typescript
'use server';

import { success, error, type Result } from '@/types/responses';

export async function createProject(
  data: ProjectData
): Promise<Result<{ id: string }>> {
  try {
    const project = await db.projects.create(data);
    return success({ id: project.id });
  } catch (err) {
    console.error('Failed to create project:', err);
    return error('Failed to create project', 500);
  }
}
```

### Client-Side Usage

```typescript
const result = await createProject(data);

if (result.success) {
  console.log('Project created:', result.data.id);
} else {
  console.error(`Error (${result.code}): ${result.error}`);
}
```

## 4. Supabase Type Generation

**Script:** `npm run update-types`

This script generates TypeScript types from your Supabase database schema.

### Setup

1. Replace `YOUR_PROJECT_ID` in `package.json` with your actual Supabase project ID
2. Run the script: `npm run update-types`

### Finding Your Project ID

Your Supabase project ID can be found in:
- Your project URL: `https://YOUR_PROJECT_ID.supabase.co`
- Project settings in the Supabase dashboard

Example:
```bash
npm run update-types
```

This will generate `src/types/supabase.ts` with up-to-date types from your database.

## Best Practices

1. **Always use the `Result<T>` type** for Server Actions
2. **Never catch errors silently** - always return an error result
3. **Update types regularly** after schema changes: `npm run update-types`
4. **Set up all environment variables** before starting the app
5. **Test error boundaries** by intentionally throwing errors in development
