import { supabase } from './supabaseClient';
import { Database } from '@/types/supabase';

export type EditorProject = Database['public']['Tables']['editor_projects']['Row'];
export type EditorProjectInsert = Database['public']['Tables']['editor_projects']['Insert'];
export type EditorProjectUpdate = Database['public']['Tables']['editor_projects']['Update'];

export interface ProjectState {
  title: string;
  background_url?: string;
  audio_url?: string;
  lyrics_json: any[];
  activeTab: 'editor' | 'pexels' | 'pinterest';
  selectedMedia?: any;
  audioFile?: File | null;
  audioDuration?: number;
  words?: any[];
  font?: string;
  color?: string;
  animationStyle?: string;
}

export class ProjectPersistenceService {
  private static instance: ProjectPersistenceService;
  private saveTimeout: NodeJS.Timeout | null = null;

  static getInstance(): ProjectPersistenceService {
    if (!ProjectPersistenceService.instance) {
      ProjectPersistenceService.instance = new ProjectPersistenceService();
    }
    return ProjectPersistenceService.instance;
  }

  /**
   * Get current user ID (mock for demo - replace with real auth)
   */
  private async getCurrentUserId(): Promise<string> {
    // TODO: Replace with actual auth user ID from Supabase Auth
    return 'demo-user-id';
  }

  /**
   * Save project to database with debouncing
   */
  async saveProject(
    projectState: ProjectState,
    projectId?: string,
    debounceMs: number = 1000
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Clear existing timeout to debounce saves
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      // Return a promise that resolves after debounce
      return new Promise((resolve) => {
        this.saveTimeout = setTimeout(async () => {
          try {
            const projectData: EditorProjectInsert = {
              user_id: userId,
              title: projectState.title || 'Untitled Project',
              background_url: projectState.background_url,
              audio_url: projectState.audio_url,
              lyrics_json: projectState.lyrics_json || [],
              last_edited: new Date().toISOString()
            };

            let result;
            
            if (projectId) {
              // Update existing project
              result = await (supabase as any)
                .from('editor_projects')
                .update(projectData)
                .eq('id', projectId)
                .eq('user_id', userId)
                .select()
                .single();
            } else {
              // Create new project
              result = await (supabase as any)
                .from('editor_projects')
                .insert(projectData as any)
                .select()
                .single();
            }

            if (result.error) {
              console.error('Error saving project:', result.error);
              resolve({ success: false, error: result.error.message });
              return;
            }

            resolve({ success: true, projectId: result.data.id });
          } catch (error) {
            console.error('Error in saveProject:', error);
            resolve({ success: false, error: 'Failed to save project' });
          }
        }, debounceMs);
      });
    } catch (error) {
      console.error('Error in saveProject:', error);
      return { success: false, error: 'Failed to save project' };
    }
  }

  /**
   * Force save immediately without debouncing
   */
  async saveProjectNow(
    projectState: ProjectState,
    projectId?: string
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    // Clear any pending timeouts
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    try {
      const userId = await this.getCurrentUserId();
      
      const projectData: EditorProjectInsert = {
        user_id: userId,
        title: projectState.title || 'Untitled Project',
        background_url: projectState.background_url,
        audio_url: projectState.audio_url,
        lyrics_json: projectState.lyrics_json || [],
        last_edited: new Date().toISOString()
      };

      let result;
      
      if (projectId) {
        // Update existing project
        result = await (supabase as any)
          .from('editor_projects')
          .update(projectData)
          .eq('id', projectId)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new project
        result = await (supabase as any)
          .from('editor_projects' as any)
          .insert(projectData as any)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving project:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, projectId: result.data.id };
    } catch (error) {
      console.error('Error in saveProjectNow:', error);
      return { success: false, error: 'Failed to save project' };
    }
  }

  /**
   * Load user's projects
   */
  async getUserProjects(): Promise<{ success: boolean; projects?: EditorProject[]; error?: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('editor_projects')
        .select('*')
        .eq('user_id', userId)
        .order('last_edited', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        return { success: false, error: error.message };
      }

      return { success: true, projects: data || [] };
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      return { success: false, error: 'Failed to load projects' };
    }
  }

  /**
   * Load a specific project by ID
   */
  async loadProject(projectId: string): Promise<{ success: boolean; project?: EditorProject; error?: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('editor_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, project: data };
    } catch (error) {
      console.error('Error in loadProject:', error);
      return { success: false, error: 'Failed to load project' };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { error } = await supabase
        .from('editor_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting project:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  }

  /**
   * Clean up any pending saves
   */
  cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}

export const projectPersistenceService = ProjectPersistenceService.getInstance();