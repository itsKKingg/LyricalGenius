import { NextRequest, NextResponse } from 'next/server';
import { saveAestheticAsset } from '@/app/actions/aesthetics';
import { MediaAsset } from '@/mocks/mediaMocks';

export async function POST(request: NextRequest) {
  try {
    const asset: MediaAsset = await request.json();
    
    if (!asset.url || !asset.id) {
      return NextResponse.json(
        { error: 'Invalid asset data' },
        { status: 400 }
      );
    }

    // Call the Server Action to save the asset
    const result = await saveAestheticAsset({
      url: asset.url,
      title: asset.title,
      thumbnail: asset.thumbnail,
      tags: asset.tags,
      source: asset.source,
      media_type: 'video' // All our current assets are videos
    });

    if (result.success) {
      if (result.data.duplicate) {
        return NextResponse.json(
          { error: 'Link already in vault' },
          { status: 409 }
        );
      }

      return NextResponse.json({ 
        success: true,
        message: 'Asset saved successfully',
        id: result.data.id
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.code }
      );
    }
  } catch (error) {
    console.error('Save API error:', error);
    return NextResponse.json(
      { error: 'Failed to save asset' },
      { status: 500 }
    );
  }
}
