import { NextRequest, NextResponse } from 'next/server';
import { mockMediaAssets } from '@/mocks/mediaMocks';

export async function POST(request: NextRequest) {
  try {
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
    
    if (useMocks) {
      return NextResponse.json({ 
        results: mockMediaAssets.filter(asset => asset.source === 'pexels'),
        source: 'mock'
      });
    }

    const { query } = await request.json();
    
    // In a real implementation, this would call the Pexels API
    const filteredAssets = mockMediaAssets.filter(asset => 
      asset.source === 'pexels' && 
      (asset.title.toLowerCase().includes(query?.toLowerCase() || '') ||
       asset.tags.some(tag => tag.toLowerCase().includes(query?.toLowerCase() || '')))
    );

    return NextResponse.json({ 
      results: filteredAssets,
      source: 'pexels'
    });
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pexels data' },
      { status: 500 }
    );
  }
}
