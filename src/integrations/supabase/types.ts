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
      cash_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_access: {
        Row: {
          business_name: string
          created_at: string | null
          id: string
          owner_id: string
          staff_id: string
        }
        Insert: {
          business_name: string
          created_at?: string | null
          id?: string
          owner_id: string
          staff_id: string
        }
        Update: {
          business_name?: string
          created_at?: string | null
          id?: string
          owner_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          customer_type: string | null
          email: string
          id: string
          join_date: string | null
          name: string
          phone: string | null
          status: string | null
          total_orders: number | null
          total_spent: number | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          customer_type?: string | null
          email: string
          id?: string
          join_date?: string | null
          name: string
          phone?: string | null
          status?: string | null
          total_orders?: number | null
          total_spent?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string
          id?: string
          join_date?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          total_orders?: number | null
          total_spent?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          subtotal: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string
          date: string | null
          id: string
          payment_amount: number | null
          payment_due_date: string | null
          payment_status: string | null
          status: string | null
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          date?: string | null
          id?: string
          payment_amount?: number | null
          payment_due_date?: string | null
          payment_status?: string | null
          status?: string | null
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          date?: string | null
          id?: string
          payment_amount?: number | null
          payment_due_date?: string | null
          payment_status?: string | null
          status?: string | null
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          category_type: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          last_updated: string | null
          name: string
          price: number
          purchased_price: number | null
          retail_price: number | null
          sku: string
          stock: number
          threshold: number
          trainer_price: number | null
          user_id: string | null
          wholesale_price: number | null
        }
        Insert: {
          category: string
          category_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_updated?: string | null
          name: string
          price: number
          purchased_price?: number | null
          retail_price?: number | null
          sku: string
          stock?: number
          threshold?: number
          trainer_price?: number | null
          user_id?: string | null
          wholesale_price?: number | null
        }
        Update: {
          category?: string
          category_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_updated?: string | null
          name?: string
          price?: number
          purchased_price?: number | null
          retail_price?: number | null
          sku?: string
          stock?: number
          threshold?: number
          trainer_price?: number | null
          user_id?: string | null
          wholesale_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          owner_id: string | null
          phone: string | null
          role: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          owner_id?: string | null
          phone?: string | null
          role?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          owner_id?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          role: string
          staff_email: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          role?: string
          staff_email: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          staff_email?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_amount: {
        Args: { base: number; amount: number }
        Returns: number
      }
      decrement: {
        Args: { x: number }
        Returns: number
      }
      increment: {
        Args: { x: number }
        Returns: number
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
