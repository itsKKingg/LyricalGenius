import type { MediaAsset } from "@/mocks/mediaMocks";

export interface SearchParams {
  query: string;
  source: 'pinterest' | 'pexels';
  useMocks: boolean;
}

export async function searchMedia({ query, source, useMocks }: SearchParams): Promise<MediaAsset[]> {
  try {
    const endpoint = source === 'pinterest' ? '/api/pindl' : '/api/pexels';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search media. Please try again.');
  }
}

export async function saveToProject(asset: MediaAsset): Promise<void> {
  try {
    const response = await fetch('/api/save-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Link already in vault');
      }
      throw new Error(`Save failed: ${response.statusText}`);
    }

    return;
  } catch (error) {
    if (error instanceof Error && error.message === 'Link already in vault') {
      throw error;
    }
    console.error('Save error:', error);
    throw new Error('Failed to save asset. Please try again.');
  }
}
