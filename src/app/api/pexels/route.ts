import { NextRequest, NextResponse } from 'next/server';
import { PexelsService } from '@/services/pexels.service';

export async function POST(request: NextRequest) {
  try {
    const { query, page = 1, perPage = 15 } = await request.json();
    
    // Use the PexelsService to fetch vertical videos
    const result = await PexelsService.searchVerticalVideos(query, page, perPage);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch Pexels data',
        source: 'pexels'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get('perPage') || '15');
    
    // Use the PexelsService to fetch featured vertical videos
    const result = await PexelsService.getFeaturedVideos(perPage);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Pexels Featured API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch featured Pexels data',
        source: 'pexels'
      },
      { status: 500 }
    );
  }
}
