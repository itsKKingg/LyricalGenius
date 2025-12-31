// Type definitions for Cloudflare Pages Functions

interface Env {
  GEMINI_API_KEY: string;
  ELEVENLABS_API_KEY?: string;
}

interface CloudflareContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}

export { Env, CloudflareContext };
