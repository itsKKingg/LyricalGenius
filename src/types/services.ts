/**
 * Service layer types for Pexels and Supabase integration
 * These types extend the base types and provide service-specific interfaces
 */

import { Database } from './supabase';

// Re-export database types for convenience
export type AestheticAsset = Database['public']['Tables']['aesthetic_assets']['Row'];
export type Aesthetic = Database['public']['Tables']['aesthetics']['Row'];
export type InsertAestheticAsset = Database['public']['Tables']['aesthetic_assets']['Insert'];
export type UpdateAestheticAsset = Database['public']['Tables']['aesthetic_assets']['Update'];

/**
 * Service-specific interfaces
 */
export interface PexelsVideoMetadata {
  id: number;
  width: number;
  height: number;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    fps: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

export interface ServiceError {
  message: string;
  code: number;
  service: 'pexels' | 'supabase';
  details?: any;
}

/**
 * Extended MediaAsset interface for services
 * Combines the mock MediaAsset with additional service-specific fields
 */
export interface ServiceMediaAsset {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  tags: string[];
  source: 'pinterest' | 'pexels';
  duration?: number;
  // Additional fields for service integration
  pexelsId?: number;
  photographer?: string;
  quality?: string;
  fileSize?: number;
  aspectRatio?: string;
  isVertical?: boolean;
}

/**
 * Save operation result
 */
export interface SaveResult {
  success: boolean;
  id?: string;
  duplicate?: boolean;
  error?: string;
  code?: number;
}

/**
 * Batch operation results
 */
export interface BatchSaveResult {
  saved: number;
  duplicates: number;
  errors: number;
  details?: Array<{
    index: number;
    success: boolean;
    id?: string;
    error?: string;
  }>;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  pexels: {
    apiKey: string;
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    timeout: number;
  };
}

/**
 * Search parameters for various services
 */
export interface SearchParams {
  query?: string;
  page?: number;
  perPage?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  locale?: string;
}

/**
 * Filter options for media assets
 */
export interface MediaFilters {
  source?: 'pinterest' | 'pexels';
  mediaType?: 'video' | 'image';
  duration?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  orientation?: 'portrait' | 'landscape' | 'square';
}

/**
 * Sort options for results
 */
export interface SortOptions {
  field: 'created_at' | 'use_count' | 'last_used_at' | 'title';
  direction: 'asc' | 'desc';
}

/**
 * Pagination interface
 */
export interface PaginationOptions {
  limit: number;
  offset: number;
  total?: number;
}

/**
 * Enhanced result with metadata
 */
export interface EnhancedResult<T> {
  data: T;
  metadata: {
    total: number;
    page: number;
    perPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  source: 'pexels' | 'supabase' | 'mock';
  timestamp: string;
}

/**
 * Service response wrapper
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: {
    service: 'pexels' | 'supabase';
    duration: number;
    cached: boolean;
  };
}

/**
 * Cache configuration for services
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache entries
  strategy: 'lru' | 'fifo' | 'ttl';
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  enabled: boolean;
  requests: number; // Max requests
  window: number; // Time window in seconds
  key: string; // Rate limit key (e.g., 'user', 'ip')
}