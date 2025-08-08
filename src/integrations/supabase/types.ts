export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      account: {
        Row: {
          account_group_id: string | null
          created_at: string | null
          id: string
          initial_value: number | null
          name: string
          user_id: string
        }
        Insert: {
          account_group_id?: string | null
          created_at?: string | null
          id?: string
          initial_value?: number | null
          name: string
          user_id: string
        }
        Update: {
          account_group_id?: string | null
          created_at?: string | null
          id?: string
          initial_value?: number | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_account_group_id_fkey"
            columns: ["account_group_id"]
            isOneToOne: false
            referencedRelation: "account_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      account_group: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      category: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sub_category: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_category_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          account_out_id: string | null
          created_at: string | null
          description: string | null
          id: string
          total_installments: number | null
          transaction_type_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          account_out_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          total_installments?: number | null
          transaction_type_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          account_out_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          total_installments?: number | null
          transaction_type_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_out_id_fkey"
            columns: ["account_out_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "transactions_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_installments: {
        Row: {
          account_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          installment_number: number
          transaction_id: string | null
          transaction_type_id: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          installment_number: number
          transaction_id?: string | null
          transaction_type_id?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          installment_number?: number
          transaction_id?: string | null
          transaction_type_id?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_installments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_installments_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "transactions_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_installments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_sub: {
        Row: {
          created_at: string | null
          id: string
          transactions_installments_id: string | null
          value: number
          category_id: string | null
          sub_category_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          transactions_installments_id?: string | null
          value: number
          category_id?: string | null
          sub_category_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          transactions_installments_id?: string | null
          value?: number
          category_id?: string | null
          sub_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_sub_transactions_installments_id_fkey"
            columns: ["transactions_installments_id"]
            isOneToOne: false
            referencedRelation: "transactions_installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sub_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sub_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_category"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_tag: {
        Row: {
          created_at: string | null
          id: string
          tag_id: string | null
          transactions_installments_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag_id?: string | null
          transactions_installments_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tag_id?: string | null
          transactions_installments_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tag_transactions_installments_id_fkey"
            columns: ["transactions_installments_id"]
            isOneToOne: false
            referencedRelation: "transactions_installments"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_type: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          password: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          password?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          password?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_setting: {
        Row: {
          created_at: string | null
          id: string
          theme_dark: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          theme_dark?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          theme_dark?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_setting_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
