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
      saved_movies: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          title: string
          poster_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          title: string
          poster_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          title?: string
          poster_path?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}