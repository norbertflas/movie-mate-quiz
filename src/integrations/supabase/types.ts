export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_usage_stats: {
        Row: {
          created_at: string | null
          daily_calls: number | null
          date: string
          hourly_calls: number | null
          id: string
          last_call_hour: number | null
          last_call_minute: number | null
          minute_calls: number | null
          service: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_calls?: number | null
          date: string
          hourly_calls?: number | null
          id?: string
          last_call_hour?: number | null
          last_call_minute?: number | null
          minute_calls?: number | null
          service: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_calls?: number | null
          date?: string
          hourly_calls?: number | null
          id?: string
          last_call_hour?: number | null
          last_call_minute?: number | null
          minute_calls?: number | null
          service?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorite_creators: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          tmdb_person_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role: string
          tmdb_person_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          tmdb_person_id?: number
          user_id?: string
        }
        Relationships: []
      }
      movie_list_items: {
        Row: {
          added_at: string
          id: string
          list_id: string
          title: string
          tmdb_id: number
        }
        Insert: {
          added_at?: string
          id?: string
          list_id: string
          title: string
          tmdb_id: number
        }
        Update: {
          added_at?: string
          id?: string
          list_id?: string
          title?: string
          tmdb_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "movie_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "movie_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      movie_metadata: {
        Row: {
          created_at: string
          id: string
          overview: string | null
          popularity: number | null
          poster_path: string | null
          release_date: string | null
          title: string
          tmdb_id: number
          vote_average: number | null
          vote_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          release_date?: string | null
          title: string
          tmdb_id: number
          vote_average?: number | null
          vote_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          release_date?: string | null
          title?: string
          tmdb_id?: number
          vote_average?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      movie_streaming_availability: {
        Row: {
          available_since: string
          id: string
          movie_id: string | null
          region: string
          service_id: string | null
          tmdb_id: number | null
        }
        Insert: {
          available_since?: string
          id?: string
          movie_id?: string | null
          region: string
          service_id?: string | null
          tmdb_id?: number | null
        }
        Update: {
          available_since?: string
          id?: string
          movie_id?: string | null
          region?: string
          service_id?: string | null
          tmdb_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movie_streaming_availability_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movie_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_streaming_availability_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "streaming_services"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_groups: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      quiz_history: {
        Row: {
          answers: Json
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          answers: Json
          created_at: string
          group_id: string
          id: string
          recommendation_explanations: Json | null
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          group_id: string
          id?: string
          recommendation_explanations?: Json | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          group_id?: string
          id?: string
          recommendation_explanations?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "quiz_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_movies: {
        Row: {
          created_at: string
          id: string
          poster_path: string | null
          title: string
          tmdb_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poster_path?: string | null
          title: string
          tmdb_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poster_path?: string | null
          title?: string
          tmdb_id?: number
          user_id?: string
        }
        Relationships: []
      }
      streaming_cache: {
        Row: {
          cached_at: string | null
          country: string
          expires_at: string
          hit_count: number | null
          id: string
          last_accessed: string | null
          source: string | null
          streaming_data: Json
          tmdb_id: number
        }
        Insert: {
          cached_at?: string | null
          country: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          source?: string | null
          streaming_data: Json
          tmdb_id: number
        }
        Update: {
          cached_at?: string | null
          country?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          source?: string | null
          streaming_data?: Json
          tmdb_id?: number
        }
        Relationships: []
      }
      streaming_services: {
        Row: {
          created_at: string
          id: string
          last_updated_at: string | null
          logo_url: string | null
          name: string
          regions: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated_at?: string | null
          logo_url?: string | null
          name: string
          regions: string[]
        }
        Update: {
          created_at?: string
          id?: string
          last_updated_at?: string | null
          logo_url?: string | null
          name?: string
          regions?: string[]
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_streaming_preferences: {
        Row: {
          created_at: string
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaming_preferences_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "streaming_services"
            referencedColumns: ["id"]
          },
        ]
      }
      watched_movies: {
        Row: {
          id: string
          rating: number | null
          title: string
          tmdb_id: number
          user_id: string
          watched_at: string
        }
        Insert: {
          id?: string
          rating?: number | null
          title: string
          tmdb_id: number
          user_id: string
          watched_at?: string
        }
        Update: {
          id?: string
          rating?: number | null
          title?: string
          tmdb_id?: number
          user_id?: string
          watched_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_api_usage: {
        Args: {
          p_service: string
          p_date: string
          p_hour: number
          p_minute: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
