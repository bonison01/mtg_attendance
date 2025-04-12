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
      attendance_records: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string
          id: string
          note: string | null
          status: string | null
          time_in: string | null
          time_out: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          note?: string | null
          status?: string | null
          time_in?: string | null
          time_out?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          note?: string | null
          status?: string | null
          time_in?: string | null
          time_out?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_settings: {
        Row: {
          created_at: string | null
          default_clock_in_time: string | null
          id: string
          require_code: boolean | null
          require_fingerprint: boolean | null
          require_selfie: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_clock_in_time?: string | null
          id?: string
          require_code?: boolean | null
          require_fingerprint?: boolean | null
          require_selfie?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_clock_in_time?: string | null
          id?: string
          require_code?: boolean | null
          require_fingerprint?: boolean | null
          require_selfie?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          brand_color: string | null
          company_name: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_schedules: {
        Row: {
          created_at: string | null
          employee_id: string
          expected_clock_in: string | null
          holidays: Json | null
          id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          expected_clock_in?: string | null
          holidays?: Json | null
          id?: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          expected_clock_in?: string | null
          holidays?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          email: string
          fingerprint: string | null
          id: string
          image_url: string | null
          join_date: string
          name: string
          phone_number: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          fingerprint?: string | null
          id?: string
          image_url?: string | null
          join_date: string
          name: string
          phone_number?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          fingerprint?: string | null
          id?: string
          image_url?: string | null
          join_date?: string
          name?: string
          phone_number?: string | null
          position?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
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
