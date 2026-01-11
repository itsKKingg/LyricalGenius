import { env } from '@/env.mjs';
import { MediaAsset } from '@/mocks/mediaMocks';

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    fps: number;
    link: string;
  }[];
  video_pictures: {
    id: number;
    picture: string;
    nr: number;
  }[];
}

export interface PexelsSearchResponse {
  videos: PexelsVideo[];
  total_results: number;
}

export interface PexelsServiceResult {
  results: MediaAsset[];
  source: 'pexels';
  total: number;
}

/**
 * Pexels API service for fetching vertical videos
 * Follows the same mock pattern as existing API routes
 */
export class PexelsService {
  private static readonly BASE_URL = 'https://api.pexels.com/videos';
  private static readonly API_KEY = env.PEXELS_API_KEY;

  /**
   * Search for vertical videos on Pexels
   * @param query - Search query for videos
   * @param page - Page number (default: 1)
   * @param perPage - Number of results per page (default: 15)
   * @returns Promise with search results
   */
  static async searchVerticalVideos(
    query: string = '',
    page: number = 1,
    perPage: number = 15
  ): Promise<PexelsServiceResult> {
    try {
      // Check if mocks are enabled
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
      
      if (useMocks) {
        // Return mock data filtered for Pexels
        const { mockMediaAssets } = await import('@/mocks/mediaMocks');
        const pexelsMockData = mockMediaAssets.filter(asset => asset.source === 'pexels');
        
        return {
          results: pexelsMockData,
          source: 'pexels',
          total: pexelsMockData.length
        };
      }

      // Make request to Pexels API
      const searchParams = new URLSearchParams({
        query: query || 'aesthetic vertical',
        orientation: 'portrait', // Focus on vertical videos
        size: 'medium',
        per_page: perPage.toString(),
        page: page.toString()
      });

      const response = await fetch(
        `${this.BASE_URL}/search?${searchParams.toString()}`,
        {
          headers: {
            'Authorization': this.API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data: PexelsSearchResponse = await response.json();
      
      // Transform Pexels response to our MediaAsset format
      const results = this.transformPexelsVideos(data.videos);
      
      return {
        results,
        source: 'pexels',
        total: data.total_results
      };

    } catch (error) {
      console.error('Pexels Service error:', error);
      throw new Error(`Failed to fetch Pexels videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get featured vertical videos from Pexels
   * @param perPage - Number of results per page (default: 15)
   * @returns Promise with featured videos
   */
  static async getFeaturedVideos(perPage: number = 15): Promise<PexelsServiceResult> {
    try {
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
      
      if (useMocks) {
        // Return mock data filtered for Pexels
        const { mockMediaAssets } = await import('@/mocks/mediaMocks');
        const pexelsMockData = mockMediaAssets.filter(asset => asset.source === 'pexels');
        
        return {
          results: pexelsMockData,
          source: 'pexels',
          total: pexelsMockData.length
        };
      }

      const response = await fetch(
        `${this.BASE_URL}/featured?per_page=${perPage}&orientation=portrait`,
        {
          headers: {
            'Authorization': this.API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data: PexelsVideo[] = await response.json();
      
      // Transform Pexels response to our MediaAsset format
      const results = this.transformPexelsVideos(data);
      
      return {
        results,
        source: 'pexels',
        total: results.length
      };

    } catch (error) {
      console.error('Pexels Featured Service error:', error);
      throw new Error(`Failed to fetch featured Pexels videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform Pexels video data to our MediaAsset format
   * @param videos - Array of Pexels videos
   * @returns Array of MediaAsset objects
   */
  private static transformPexelsVideos(videos: PexelsVideo[]): MediaAsset[] {
    return videos
      .filter(video => video.height > video.width) // Only vertical videos
      .map(video => {
        // Find the best quality video file
        const bestVideoFile = video.video_files
          .sort((a, b) => {
            // Prefer HD quality, then sort by file size
            const qualityOrder = { 'hd': 3, 'sd': 2, 'uhd': 4, 'sd2': 1 };
            const aQuality = qualityOrder[a.quality as keyof typeof qualityOrder] || 0;
            const bQuality = qualityOrder[b.quality as keyof typeof qualityOrder] || 0;
            return bQuality - aQuality;
          })[0];

        // Get the best thumbnail (usually the first picture)
        const bestThumbnail = video.video_pictures[0]?.picture || video.image;

        return {
          id: video.id.toString(),
          url: bestVideoFile.link,
          thumbnail: bestThumbnail,
          title: `Pexels Video ${video.id}`,
          tags: this.generateTagsFromVideo(video),
          source: 'pexels' as const,
          duration: video.duration
        };
      });
  }

  /**
   * Generate tags based on video metadata
   * @param video - Pexels video object
   * @returns Array of tags
   */
  private static generateTagsFromVideo(video: PexelsVideo): string[] {
    const tags: string[] = ['vertical', 'video'];
    
    // Add tags based on dimensions
    if (video.height >= 1080) tags.push('hd');
    if (video.duration <= 10) tags.push('short');
    else if (video.duration >= 30) tags.push('long');
    
    // Add photographer name as tag
    if (video.user.name) {
      tags.push(video.user.name.toLowerCase().replace(/\s+/g, ''));
    }
    
    return tags.slice(0, 5); // Limit to 5 tags
  }
}