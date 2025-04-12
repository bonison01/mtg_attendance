
import { Database as DatabaseGenerated } from "./types";

// Extend the Database type with our custom tables
export type Database = DatabaseGenerated & {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone_number: string | null;
          position: string;
          department: string | null;
          join_date: string;
          image_url: string | null;
          fingerprint: string | null;
          date_of_birth: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone_number?: string | null;
          position: string;
          department?: string | null;
          join_date: string;
          image_url?: string | null;
          fingerprint?: string | null;
          date_of_birth?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone_number?: string | null;
          position?: string;
          department?: string | null;
          join_date?: string;
          image_url?: string | null;
          fingerprint?: string | null;
          date_of_birth?: string | null;
          created_at?: string | null;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          time_in: string | null;
          time_out: string | null;
          status: string | null;
          note: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          time_in?: string | null;
          time_out?: string | null;
          status?: string | null;
          note?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          time_in?: string | null;
          time_out?: string | null;
          status?: string | null;
          note?: string | null;
          created_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          role?: string | null;
          created_at?: string | null;
        };
      };
      company_settings: {
        Row: {
          id: string;
          company_name: string;
          brand_color: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_name?: string;
          brand_color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          brand_color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      attendance_settings: {
        Row: {
          id: string;
          require_code: boolean | null;
          require_selfie: boolean | null;
          require_fingerprint: boolean | null;
          default_clock_in_time: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          require_code?: boolean | null;
          require_selfie?: boolean | null;
          require_fingerprint?: boolean | null;
          default_clock_in_time?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          require_code?: boolean | null;
          require_selfie?: boolean | null;
          require_fingerprint?: boolean | null;
          default_clock_in_time?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      employee_schedules: {
        Row: {
          id: string;
          employee_id: string;
          expected_clock_in: string | null;
          holidays: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          employee_id: string;
          expected_clock_in?: string | null;
          holidays?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          employee_id?: string;
          expected_clock_in?: string | null;
          holidays?: Json | null;
          created_at?: string | null;
        };
      };
    };
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
