# Node.js Backend Implementation

## Overview
This implementation provides the Node.js backend logic for fetching vertical videos using the Pexels API and saving aesthetic assets to Supabase with duplicate prevention.

## Components Created

### 1. Pexels Service (`src/services/pexels.service.ts`)
- **Purpose**: Fetches vertical videos from Pexels API
- **Features**:
  - Supports mock data mode for development (`NEXT_PUBLIC_USE_MOCKS=true`)
  - Focuses on vertical videos (portrait orientation)
  - Searches with customizable query, pagination
  - Transforms Pexels data to MediaAsset format
  - Generates smart tags based on video metadata

### 2. Server Actions (`src/app/actions/aesthetics.ts`)
- **Purpose**: Handles aesthetic asset management with Supabase integration
- **Features**:
  - `saveAestheticAsset()`: Saves single asset with duplicate checking
  - `saveMultipleAestheticAssets()`: Batch saves multiple assets
  - `getUserAestheticAssets()`: Retrieves user's saved assets
  - **Duplicate Prevention**: Checks for existing URLs before saving
  - **Automatic Aesthetic Creation**: Creates default aesthetic if none exists
  - **Usage Tracking**: Updates use count and last used timestamps

### 3. Updated API Routes
- **`src/app/api/pexels/route.ts`**: Now uses PexelsService
- **`src/app/api/save-asset/route.ts`**: Integrated with Server Actions

## Key Features

### Duplicate Prevention Logic
```typescript
// Check if asset already exists
const existingAsset = await supabase
  .from('aesthetic_assets')
  .select('id, use_count')
  .eq('url', metadata.url)
  .eq('aesthetic_id', aestheticId)
  .single();

if (existingAsset) {
  // Update use count instead of creating duplicate
  const newUseCount = (existingAsset.use_count || 0) + 1;
  // ... update existing record
  return success({ id: existingAsset.id, duplicate: true });
}
```

### Mock Support
- Environment variable `NEXT_PUBLIC_USE_MOCKS=true` enables mock data
- Safe for development without consuming API credits
- Maintains same data structure as real API

### Error Handling
- Comprehensive try-catch blocks
- Proper HTTP status codes
- User-friendly error messages
- Console logging for debugging

## Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PEXELS_API_KEY=your-pexels-api-key
NEXT_PUBLIC_USE_MOCKS=true  # for development
```

## Usage Examples

### Fetching Vertical Videos
```typescript
import { PexelsService } from '@/services/pexels.service';

// Search for vertical videos
const result = await PexelsService.searchVerticalVideos('aesthetic', 1, 15);

// Get featured vertical videos
const featured = await PexelsService.getFeaturedVideos(10);
```

### Saving Aesthetic Assets
```typescript
import { saveAestheticAsset } from '@/app/actions/aesthetics';

const result = await saveAestheticAsset({
  url: 'https://example.com/video.mp4',
  title: 'Beautiful Sunset',
  source: 'pexels',
  media_type: 'video'
});
```

## Database Schema Integration
- **Table**: `aesthetic_assets`
- **Key Fields**: `url`, `aesthetic_id`, `media_type`, `source`, `use_count`
- **Duplicate Key**: `url` + `aesthetic_id` combination
- **Auto Fields**: `use_count` (starts at 1), `last_used_at`, `created_at`

## Benefits
1. **Prevents Database Cluttering**: Duplicate URLs are detected and use count is updated
2. **Cost Efficient**: Mock mode prevents unnecessary API calls during development
3. **Type Safe**: Full TypeScript support with proper error handling
4. **Scalable**: Batch operations supported for bulk imports
5. **User Friendly**: Clear error messages and status codes