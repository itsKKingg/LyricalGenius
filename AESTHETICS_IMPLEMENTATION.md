# Aesthetics Browser & Mocking Layer

This implementation provides a complete UI for searching and saving aesthetic video assets with a built-in mocking layer for development and testing.

## Features Implemented

### 1. Mocking Strategy (Credit Protection)
- **File**: `src/mocks/mediaMocks.ts`
- Contains 10 fake vertical video objects with URLs, thumbnails, and tags
- API routes check `process.env.NEXT_PUBLIC_USE_MOCKS === 'true'` to return mock data
- Mock mode prevents API calls to protect credit/usage limits

### 2. Media Browser UI (Shadcn/UI + Framer Motion)
- **Component**: `components/media/MediaGrid.tsx`
- Responsive grid layout with aspect ratio handling for vertical videos
- Video preview on hover with smooth transitions
- "Add to Project" button with loading states
- Staggered fade-in animations using Framer Motion

### 3. Search Bar with Toggles
- **Component**: `components/media/SearchBar.tsx`
- Search input with instant search capability
- Source toggle: Pinterest vs. Pexels
- Mock Mode toggle for switching between real and fake data
- Clean, modern UI with visual feedback

### 4. State Management & User Feedback
- Dedicated state for saving operations
- Loading spinners on individual cards during save operations
- Toast notifications for success and error states
- Duplicate detection with "Link already in vault" warnings

### 5. API Integration
- **Endpoints**:
  - `/api/pindl` - Pinterest search endpoint
  - `/api/pexels` - Pexels search endpoint  
  - `/api/save-asset` - Asset saving endpoint
- Graceful error handling and fallback states
- Mock data filtering by source

## Technical Stack

- **Frontend**: Next.js 14 with App Router
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion
- **State Management**: React hooks with custom state
- **Icons**: Lucide React
- **Notifications**: Radix UI Toast

## Usage

1. **Navigate to**: `/aesthetics`
2. **Search**: Enter keywords and select source (Pinterest/Pexels)
3. **Toggle Mock Mode**: Use the toggle to switch between real API calls and mock data
4. **Browse Results**: Hover over cards to see video previews
5. **Save Assets**: Click "Add to Project" to save assets to your collection

## Environment Variables

```bash
NEXT_PUBLIC_USE_MOCKS=true  # Enable mock data (recommended for development)
NEXT_PUBLIC_USE_MOCKS=false # Use real API calls

# Other required variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
PEXELS_API_KEY=your-pexels-api-key
```

## Key Components Structure

```
src/
├── components/
│   ├── media/
│   │   ├── MediaGrid.tsx      # Main grid component with animations
│   │   └── SearchBar.tsx       # Search interface with toggles
│   └── ui/                     # Reusable UI components (Button, Card, Toast, etc.)
├── lib/
│   ├── mediaService.ts         # API interaction logic
│   └── utils.ts               # Utility functions
├── mocks/
│   └── mediaMocks.ts          # Mock data for development
└── app/
    ├── api/
    │   ├── pindl/route.ts     # Pinterest API proxy
    │   ├── pexels/route.ts    # Pexels API proxy
    │   └── save-asset/route.ts # Asset saving endpoint
    ├── aesthetics/page.tsx    # Main aesthetics browser page
    └── layout.tsx             # Root layout with Toaster provider
```

## Mock Data Details

The mock data includes:
- 10 diverse aesthetic video assets
- Mix of Pinterest and Pexels sources
- High-quality Unsplash thumbnails
- Relevant tags for filtering
- Duration metadata
- Unique IDs for deduplication

## Future Enhancements

1. **Video Preview**: Implement actual video playback on hover
2. **Advanced Filtering**: Add filters by duration, resolution, etc.
3. **User Collections**: Allow users to create named collections
4. **Drag & Drop**: Enable drag-and-drop organization
5. **Bulk Operations**: Select and save multiple assets at once
6. **Real API Integration**: Connect to actual Pinterest and Pexels APIs
