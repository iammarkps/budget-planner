export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          id: string
          month: string
          rollover: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          id?: string
          month: string
          rollover?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          id?: string
          month?: string
          rollover?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          name: string
          parent_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          created_at: string
          id: string
          quote_currency: string
          rate: number
          rate_date: string
          source: string | null
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          id?: string
          quote_currency: string
          rate: number
          rate_date: string
          source?: string | null
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          id?: string
          quote_currency?: string
          rate?: number
          rate_date?: string
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          currency_code: string
          day_of_month: number | null
          day_of_week: number | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          merchant: string | null
          next_occurrence: string
          note: string | null
          start_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          currency_code?: string
          day_of_month?: number | null
          day_of_week?: number | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          merchant?: string | null
          next_occurrence: string
          note?: string | null
          start_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          currency_code?: string
          day_of_month?: number | null
          day_of_week?: number | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          merchant?: string | null
          next_occurrence?: string
          note?: string | null
          start_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_deductions: {
        Row: {
          cap_amount: number | null
          cap_percent: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          tax_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cap_amount?: number | null
          cap_percent?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tax_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cap_amount?: number | null
          cap_percent?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tax_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_rules_th: {
        Row: {
          bracket_max: number | null
          bracket_min: number
          created_at: string
          id: string
          rate: number
          tax_year: number
          user_id: string
        }
        Insert: {
          bracket_max?: number | null
          bracket_min: number
          created_at?: string
          id?: string
          rate: number
          tax_year: number
          user_id: string
        }
        Update: {
          bracket_max?: number | null
          bracket_min?: number
          created_at?: string
          id?: string
          rate?: number
          tax_year?: number
          user_id?: string
        }
        Relationships: []
      }
      transaction_tags: {
        Row: {
          created_at: string
          tag_id: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tag_id: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tag_id?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount_base_thb: number
          amount_original: number
          category_id: string | null
          created_at: string
          currency_code: string
          id: string
          merchant: string | null
          note: string | null
          occurred_at: string
          rate_used: number
          raw_nl_input: string | null
          tax_deduction_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount_base_thb: number
          amount_original: number
          category_id?: string | null
          created_at?: string
          currency_code: string
          id?: string
          merchant?: string | null
          note?: string | null
          occurred_at: string
          rate_used: number
          raw_nl_input?: string | null
          tax_deduction_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount_base_thb?: number
          amount_original?: number
          category_id?: string | null
          created_at?: string
          currency_code?: string
          id?: string
          merchant?: string | null
          note?: string | null
          occurred_at?: string
          rate_used?: number
          raw_nl_input?: string | null
          tax_deduction_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tax_deduction_id_fkey"
            columns: ["tax_deduction_id"]
            isOneToOne: false
            referencedRelation: "tax_deductions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          base_currency: string
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          full_name?: string | null
          id?: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
