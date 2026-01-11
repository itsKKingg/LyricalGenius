# Deep Mode Audio Pipeline Implementation

## Overview
The Deep Mode Audio Pipeline provides server-side logic to isolate vocals from audio files and transcribe lyrics with word-level timestamps.

## Architecture

### 1. Database Schema
**New Columns in `projects` Table:**
- `status`: enum - Tracks processing state ('idle', 'uploading', 'isolating', 'transcribing', 'completed', 'error')
- `audio_url`: text - URL of the uploaded audio file in Supabase storage
- `isolated_vocals_url`: text - URL of the isolated vocals file
- `error_message`: text - Error details if processing fails

**Supabase Storage:**
- Bucket: `project-audio`
- Public access enabled for AI processing
- Row Level Security policies for user-specific access

### 2. Server Actions

#### `uploadAudioToSupabase(projectId, userId, file)`
**Location:** `src/app/actions/uploadAudio.ts`

Handles audio file uploads to Supabase storage.

**Flow:**
1. Validates user owns the project
2. Sets status to 'uploading'
3. Uploads file to `project-audio/{userId}/{projectId}-{timestamp}.{ext}`
4. Updates project with `audio_url` and resets status to 'idle'

**Returns:**
```typescript
{
  success: boolean;
  audioUrl?: string;
  error?: string;
}
```

#### `processDeepMode(projectId, userId)`
**Location:** `src/app/actions/processDeepMode.ts`

Orchestrates the complete Deep Mode workflow.

**Flow:**
1. Validates project and audio_url exist
2. Sets status to 'isolating'
3. Calls isolation service
4. Updates with `isolated_vocals_url`
5. Sets status to 'transcribing'
6. Calls transcription service
7. Saves lyrics to `lyrics_source` table
8. Sets status to 'completed'

**Error Handling:**
- All steps wrapped in try/catch
- DB status updated at every step
- Errors logged to `error_message` field
- Status set to 'error' on failure

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  projectStatus?: string;
}
```

### 3. AI Services

#### Isolation Service
**Location:** `src/services/ai/isolation.service.ts`

Isolates vocals using Hugging Face Inference API.

**Configuration:**
- Model: `facebook/demucs`
- Timeout: 30 seconds
- Environment: `HUGGINGFACE_API_KEY`

**Mock Mode:**
Returns predefined vocals URL after 2-second delay when `NEXT_PUBLIC_USE_MOCKS=true`

#### Transcription Service
**Location:** `src/services/ai/transcription.service.ts`

Transcribes audio using Groq's Whisper API.

**Configuration:**
- Model: `whisper-large-v3`
- Response Format: `verbose_json`
- Timestamp Granularities: `['word']`
- Environment: `GROQ_API_KEY`

**Output Structure:**
```typescript
{
  text: string;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    // ... additional metadata
  }>;
  words: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  language: string;
  duration: number;
}
```

**Mock Mode:**
Returns hardcoded transcription with 44 words after 2-second delay when `NEXT_PUBLIC_USE_MOCKS=true`

### 4. Mock Mode (Credit Saver)

**Location:** `src/mocks/aiMocks.ts`

**Purpose:** Development testing without consuming API credits

**Mock Data:**
- Hardcoded song transcription with word-level timestamps
- 44 words across 4 segments
- ~32.5 seconds duration
- Mock isolated vocals URL

**Activation:**
Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local`

**Behavior:**
- 2-second simulated delay for isolation
- 2-second simulated delay for transcription
- Returns realistic test data matching production API shape

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key

# Optional (required in production)
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Development (credit saver)
NEXT_PUBLIC_USE_MOCKS=true
```

## Usage Example

```typescript
import { uploadAudioToSupabase } from '@/app/actions/uploadAudio';
import { processDeepMode } from '@/app/actions/processDeepMode';

// 1. Upload audio file
const uploadResult = await uploadAudioToSupabase(
  projectId,
  userId,
  audioFile
);

if (!uploadResult.success) {
  console.error(uploadResult.error);
  return;
}

// 2. Process with Deep Mode
const processResult = await processDeepMode(projectId, userId);

if (!processResult.success) {
  console.error(processResult.error);
  return;
}

// 3. Check project status
// Status will be 'completed' and lyrics available in lyrics_source table
```

## Database Migrations

Run migrations to set up the schema:
```bash
# Apply migration
supabase db push

# Or manually run:
# supabase/migrations/20240102000000_add_deep_mode_columns.sql
```

## Error Handling Strategy

1. **Validation Errors:** Caught early, prevent processing start
2. **Timeout Errors:** 30-second limit on isolation, logged to DB
3. **API Errors:** Caught, logged to `error_message`, status set to 'error'
4. **Unexpected Errors:** Caught by outer try/catch, logged with details

## Status Flow

```
idle → uploading → idle → isolating → transcribing → completed
                      ↓          ↓           ↓           ↓
                    error      error       error       error
```

## Testing

### With Mock Mode (Recommended for Development)
```env
NEXT_PUBLIC_USE_MOCKS=true
```

- No API calls made
- No credits consumed
- 2-second delays simulate real processing
- Realistic test data returned

### With Real APIs
```env
NEXT_PUBLIC_USE_MOCKS=false
GROQ_API_KEY=actual-key
HUGGINGFACE_API_KEY=actual-key
```

- Real API calls to Groq and Hugging Face
- Consumes API credits
- Actual processing times (30s+ for isolation)
- Real transcription results

## Future Enhancements

- [ ] Progress tracking within each stage
- [ ] Retry logic for transient failures
- [ ] Batch processing for multiple projects
- [ ] Alternative isolation models
- [ ] Cost estimation before processing
- [ ] Webhook notifications on completion
