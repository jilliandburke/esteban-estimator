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
      epics: {
        Row: {
          created_at: string
          description: string | null
          id: number
          link: string | null
          shortcut_id: string | null
          story_count: number | null
          team_completed_estimation_at: string | null
          team_id: string
          title: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          link?: string | null
          shortcut_id?: string | null
          story_count?: number | null
          team_completed_estimation_at?: string | null
          team_id: string
          title?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          link?: string | null
          shortcut_id?: string | null
          story_count?: number | null
          team_completed_estimation_at?: string | null
          team_id?: string
          title?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "epics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["uuid"]
          },
        ]
      }
      estimations: {
        Row: {
          created_at: string
          epic_id: string
          estimation: number
          estimation_submitted: boolean
          id: number
          story_id: string
          team_id: string
          updated_at: string
          user_id: string
          uuid: string
        }
        Insert: {
          created_at?: string
          epic_id: string
          estimation: number
          estimation_submitted?: boolean
          id?: number
          story_id?: string
          team_id: string
          updated_at?: string
          user_id?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          epic_id?: string
          estimation?: number
          estimation_submitted?: boolean
          id?: number
          story_id?: string
          team_id?: string
          updated_at?: string
          user_id?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimations_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "estimations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "estimations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "estimations_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_scales: {
        Row: {
          created_at: string
          id: number
          name: string | null
          scale: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          scale?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          scale?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          theme: Database["public"]["Enums"]["Theme"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          theme?: Database["public"]["Enums"]["Theme"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          theme?: Database["public"]["Enums"]["Theme"]
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
          uuid?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: number
          point_scale_id: string | null
          require_review: boolean
          sc_api_key: string | null
          sc_label_id: number | null
          team_id: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          id?: number
          point_scale_id?: string | null
          require_review?: boolean
          sc_api_key?: string | null
          sc_label_id?: number | null
          team_id?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          id?: number
          point_scale_id?: string | null
          require_review?: boolean
          sc_api_key?: string | null
          sc_label_id?: number | null
          team_id?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_point_scale_id_fkey"
            columns: ["point_scale_id"]
            isOneToOne: false
            referencedRelation: "point_scales"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["uuid"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          description: string | null
          epic_id: string
          id: number
          shortcut_id: string | null
          story_points: number | null
          title: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          epic_id?: string
          id?: number
          shortcut_id?: string | null
          story_points?: number | null
          title?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          epic_id?: string
          id?: number
          shortcut_id?: string | null
          story_points?: number | null
          title?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["uuid"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: number
          member_count: number | null
          name: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          id?: number
          member_count?: number | null
          name?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          id?: number
          member_count?: number | null
          name?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: []
      }
      users_roles: {
        Row: {
          created_at: string
          id: number
          role_id: string
          updated_at: string
          user_id: string
          uuid: string
        }
        Insert: {
          created_at?: string
          id?: number
          role_id: string
          updated_at?: string
          user_id: string
          uuid?: string
        }
        Update: {
          created_at?: string
          id?: number
          role_id?: string
          updated_at?: string
          user_id?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_teams: {
        Row: {
          created_at: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "users_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      "Point Scales": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
      Theme: "system" | "light" | "dark"
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
    Enums: {
      "Point Scales": ["[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"],
      Theme: ["system", "light", "dark"],
    },
  },
} as const
