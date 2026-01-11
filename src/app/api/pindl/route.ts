import { NextRequest, NextResponse } from 'next/server';
import { mockMediaAssets } from '@/mocks/mediaMocks';

export async function POST(request: NextRequest) {
  try {
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
    
    if (useMocks) {
      return NextResponse.json({ 
        results: mockMediaAssets.filter(asset => asset.source === 'pinterest'),
        source: 'mock'
      });
    }

    const { query } = await request.json();
    
    // In a real implementation, this would call the Python pindl service
    // For now, return mock data filtered for pinterest
    const filteredAssets = mockMediaAssets.filter(asset => 
      asset.source === 'pinterest' && 
      (asset.title.toLowerCase().includes(query?.toLowerCase() || '') ||
       asset.tags.some(tag => tag.toLowerCase().includes(query?.toLowerCase() || '')))
    );

    return NextResponse.json({ 
      results: filteredAssets,
      source: 'pinterest'
    });
  } catch (error) {
    console.error('Pinterest API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pinterest data' },
      { status: 500 }
    );
  }
}
