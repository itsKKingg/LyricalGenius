import { NextRequest, NextResponse } from 'next/server';

const savedAssets = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const asset = await request.json();
    
    if (!asset.url || !asset.id) {
      return NextResponse.json(
        { error: 'Invalid asset data' },
        { status: 400 }
      );
    }

    if (savedAssets.has(asset.url)) {
      return NextResponse.json(
        { error: 'Link already in vault' },
        { status: 409 }
      );
    }

    savedAssets.add(asset.url);
    
    console.log('Saved asset:', asset.title, 'from', asset.source);
    
    return NextResponse.json({ 
      success: true,
      message: 'Asset saved successfully'
    });
  } catch (error) {
    console.error('Save API error:', error);
    return NextResponse.json(
      { error: 'Failed to save asset' },
      { status: 500 }
    );
  }
}
