export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          song_title: string
          artist_name: string | null
          bpm: number | null
          created_at: string
          status: string | null
          timed_json: Json | null
          processing_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          song_title: string
          artist_name?: string | null
          bpm?: number | null
          created_at?: string
          status?: string | null
          timed_json?: Json | null
          processing_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          song_title?: string
          artist_name?: string | null
          bpm?: number | null
          created_at?: string
          status?: string | null
          timed_json?: Json | null
          processing_notes?: string | null
        }
      }
      lyrics_source: {
        Row: {
          id: string
          project_id: string
          raw_text: string
          timed_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          raw_text: string
          timed_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          raw_text?: string
          timed_json?: Json | null
          created_at?: string
        }
      }
      editor_projects: {
        Row: {
          id: string
          user_id: string

          project_name: string
          song_title: string | null
          artist_name: string | null
          audio_file_url: string | null
          audio_duration: number | null
          clip_range: number[] | null
          sections: Json | null
          words: Json | null
          videos: Json | null
          photos: Json | null
          aesthetic_id: string | null
          font: string | null
          color: string | null
          animation_style: string | null

          title: string
          background_url: string | null
          audio_url: string | null
          lyrics_json: Json | null

          video_url: string | null
          status: string | null

          created_at: string
          updated_at: string
          last_edited: string
        }
        Insert: {
          id?: string
          user_id: string

          project_name?: string
          song_title?: string | null
          artist_name?: string | null
          audio_file_url?: string | null
          audio_duration?: number | null
          clip_range?: number[] | null
          sections?: Json | null
          words?: Json | null
          videos?: Json | null
          photos?: Json | null
          aesthetic_id?: string | null
          font?: string | null
          color?: string | null
          animation_style?: string | null

          title?: string
          background_url?: string | null
          audio_url?: string | null
          lyrics_json?: Json | null

          video_url?: string | null
          status?: string | null

          created_at?: string
          updated_at?: string
          last_edited?: string
        }
        Update: {
          id?: string
          user_id?: string

          project_name?: string
          song_title?: string | null
          artist_name?: string | null
          audio_file_url?: string | null
          audio_duration?: number | null
          clip_range?: number[] | null
          sections?: Json | null
          words?: Json | null
          videos?: Json | null
          photos?: Json | null
          aesthetic_id?: string | null
          font?: string | null
          color?: string | null
          animation_style?: string | null

          title?: string
          background_url?: string | null
          audio_url?: string | null
          lyrics_json?: Json | null

          video_url?: string | null
          status?: string | null

          created_at?: string
          updated_at?: string
          last_edited?: string
        }
      }
      aesthetics: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      aesthetic_assets: {
        Row: {
          id: string
          aesthetic_id: string
          url: string
          media_type: 'video' | 'image' | null
          source: 'pinterest' | 'pexels' | 'upload' | null
          use_count: number
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aesthetic_id: string
          url: string
          media_type?: 'video' | 'image' | null
          source?: 'pinterest' | 'pexels' | 'upload' | null
          use_count?: number
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aesthetic_id?: string
          url?: string
          media_type?: 'video' | 'image' | null
          source?: 'pinterest' | 'pexels' | 'upload' | null
          use_count?: number
          last_used_at?: string | null
          created_at?: string
        }
      }
      aesthetic_hooks: {
        Row: {
          id: string
          aesthetic_id: string
          text_content: string
          created_at: string
        }
        Insert: {
          id?: string
          aesthetic_id: string
          text_content: string
          created_at?: string
        }
        Update: {
          id?: string
          aesthetic_id?: string
          text_content?: string
          created_at?: string
        }
      }
      video_edits: {
        Row: {
          id: string
          project_id: string
          aesthetic_id: string | null
          layout_type: string
          status: 'draft' | 'queued' | 'published'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          aesthetic_id?: string | null
          layout_type?: string
          status?: 'draft' | 'queued' | 'published'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          aesthetic_id?: string | null
          layout_type?: string
          status?: 'draft' | 'queued' | 'published'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
