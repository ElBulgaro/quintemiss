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
      auth_users: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          id: string
          image_url: string
          instagram: string | null
          name: string
          official_photo_url: string | null
          portrait_url: string | null
          region: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          id?: string
          image_url: string
          instagram?: string | null
          name: string
          official_photo_url?: string | null
          portrait_url?: string | null
          region: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string
          instagram?: string | null
          name?: string
          official_photo_url?: string | null
          portrait_url?: string | null
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      official_results: {
        Row: {
          created_at: string
          final_ranking: string[]
          id: string
          ordered_ranking: string[] | null
          semi_finalists: string[]
          submitted_at: string
          top_5: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          final_ranking: string[]
          id?: string
          ordered_ranking?: string[] | null
          semi_finalists: string[]
          submitted_at?: string
          top_5?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          final_ranking?: string[]
          id?: string
          ordered_ranking?: string[] | null
          semi_finalists?: string[]
          submitted_at?: string
          top_5?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      prediction_items: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          position: number
          prediction_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          position: number
          prediction_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          position?: number
          prediction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_items_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_items_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          created_at: string
          id: string
          predictions: string[]
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          predictions: string[]
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          predictions?: string[]
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      rankings: {
        Row: {
          candidate_id: string
          created_at: string
          event_id: string
          id: string
          position: number | null
          ranking_type: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          event_id: string
          id?: string
          position?: number | null
          ranking_type: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          event_id?: string
          id?: string
          position?: number | null
          ranking_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rankings_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "official_results"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          created_at: string
          id: string
          official_result_id: string | null
          perfect_match: boolean
          score: number
          scored_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          official_result_id?: string | null
          perfect_match?: boolean
          score?: number
          scored_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          official_result_id?: string | null
          perfect_match?: boolean
          score?: number
          scored_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_official_result_id_fkey"
            columns: ["official_result_id"]
            isOneToOne: false
            referencedRelation: "official_results"
            referencedColumns: ["id"]
          },
        ]
      }
      sheet_candidates: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          instagram: string | null
          last_synced_at: string
          name: string
          official_photo_url: string | null
          portrait_url: string | null
          ranking: string | null
          region: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram?: string | null
          last_synced_at?: string
          name: string
          official_photo_url?: string | null
          portrait_url?: string | null
          ranking?: string | null
          region: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram?: string | null
          last_synced_at?: string
          name?: string
          official_photo_url?: string | null
          portrait_url?: string | null
          ranking?: string | null
          region?: string
          updated_at?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
