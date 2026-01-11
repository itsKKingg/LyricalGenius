'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase';
import { Result, success, error } from '@/types/responses';
import { MediaAsset } from '@/mocks/mediaMocks';

export interface SaveAssetMetadata {
  url: string;
  title?: string;
  thumbnail?: string;
  tags?: string[];
  source: 'pinterest' | 'pexels' | 'upload';
  media_type: 'video' | 'image';
  aesthetic_id?: string; // If not provided, will use a default aesthetic
  user_id?: string; // If not provided, will get from session
}

/**
 * Server Action to save aesthetic asset metadata to Supabase
 * Includes duplicate URL checking to prevent database clutter
 */
export async function saveAestheticAsset(
  metadata: SaveAssetMetadata
): Promise<Result<{ id: string; duplicate: boolean }>> {
  try {
    // Initialize Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // The set method can only be called from a Server Component
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // The remove method can only be called from a Server Component
            }
          },
        },
      }
    );

    // Get current user from session
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return error('User not authenticated', 401);
    }

    // Get or create user's aesthetic
    const { data: userAesthetic, error: aestheticError } = await (supabase as any)
      .from('aesthetics')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    // If no aesthetic exists, create one
    let aestheticId = userAesthetic?.id;
    if (!aestheticId) {
      const { data: newAesthetic, error: createError } = await (supabase as any)
        .from('aesthetics')
        .insert({
          user_id: user.id,
          name: 'Default',
          description: 'Default aesthetic collection'
        })
        .select('id')
        .single();

      if (createError || !newAesthetic) {
        console.error('Error creating aesthetic:', createError);
        return error('Failed to create aesthetic', 500);
      }
      aestheticId = newAesthetic.id;
    }

    // Check if asset already exists (duplicate check)
    const { data: existingAsset, error: selectError } = await (supabase as any)
      .from('aesthetic_assets')
      .select('id, use_count')
      .eq('url', metadata.url)
      .eq('aesthetic_id', aestheticId)
      .single();

    if (existingAsset) {
      // Asset exists - update use count and last used timestamp
      const newUseCount = (existingAsset.use_count || 0) + 1;
      
      const { error: updateError } = await (supabase as any)
        .from('aesthetic_assets')
        .update({
          use_count: newUseCount,
          last_used_at: new Date().toISOString()
        })
        .eq('id', existingAsset.id);

      if (updateError) {
        console.error('Error updating existing asset:', updateError);
        return error('Failed to update existing asset', 500);
      }

      // Revalidate the aesthetics page to reflect changes
      revalidatePath('/aesthetics');
      
      return success({
        id: existingAsset.id,
        duplicate: true
      });
    }

    // Insert new aesthetic asset
    const { data: newAsset, error: insertError } = await (supabase as any)
      .from('aesthetic_assets')
      .insert({
        aesthetic_id: aestheticId,
        url: metadata.url,
        media_type: metadata.media_type,
        source: metadata.source,
        use_count: 1,
        last_used_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError || !newAsset) {
      console.error('Error inserting new asset:', insertError);
      return error('Failed to save new asset', 500);
    }

    // Revalidate the aesthetics page to reflect changes
    revalidatePath('/aesthetics');

    return success({
      id: newAsset.id,
      duplicate: false
    });

  } catch (err) {
    console.error('Server Action error:', err);
    return error(
      `Failed to save aesthetic asset: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Server Action to save multiple aesthetic assets at once
 * More efficient for batch operations
 */
export async function saveMultipleAestheticAssets(
  assets: SaveAssetMetadata[]
): Promise<Result<{ saved: number; duplicates: number; errors: number }>> {
  try {
    const results = {
      saved: 0,
      duplicates: 0,
      errors: 0
    };

    // Process assets in parallel but with limited concurrency to avoid overwhelming the database
    const batchSize = 5;
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(asset => saveAestheticAsset(asset))
      );

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            if (result.value.data.duplicate) {
              results.duplicates++;
            } else {
              results.saved++;
            }
          } else {
            results.errors++;
          }
        } else {
          results.errors++;
        }
      });
    }

    // Revalidate the aesthetics page once at the end
    revalidatePath('/aesthetics');

    return success(results);

  } catch (err) {
    console.error('Batch save error:', err);
    return error(
      `Failed to save multiple assets: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Server Action to get user's aesthetic assets
 */
export async function getUserAestheticAssets(
  aestheticId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<Result<any[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // The set method can only be called from a Server Component
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // The remove method can only be called from a Server Component
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return error('User not authenticated', 401);
    }

    let query = (supabase as any)
      .from('aesthetic_assets')
      .select(`
        *,
        aesthetics!inner (
          user_id
        )
      `)
      .eq('aesthetics.user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (aestheticId) {
      query = query.eq('aesthetic_id', aestheticId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching aesthetic assets:', fetchError);
      return error('Failed to fetch aesthetic assets', 500);
    }

    // Transform the data to remove the joined aesthetics info
    const assets = data?.map((item: any) => {
      const { aesthetics, ...asset } = item;
      return asset;
    }) || [];

    return success(assets);

  } catch (err) {
    console.error('Get aesthetic assets error:', err);
    return error(
      `Failed to get aesthetic assets: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}