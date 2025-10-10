import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone_number: string | null;
          is_anonymous: boolean;
          preferred_language: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone_number?: string | null;
          is_anonymous?: boolean;
          preferred_language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone_number?: string | null;
          is_anonymous?: boolean;
          preferred_language?: string;
          created_at?: string;
        };
      };
      authorities: {
        Row: {
          id: string;
          name: string;
          type: 'police' | 'ngo' | 'helpline';
          contact_number: string;
          email: string | null;
          address: string | null;
          district: string;
          state: string;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          response_time_avg: number;
          created_at: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          user_id: string | null;
          incident_type: 'child_marriage' | 'domestic_violence' | 'harassment' | 'healthcare_denial' | 'other';
          description: string;
          severity: 'critical' | 'high' | 'medium' | 'low';
          status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated';
          latitude: number;
          longitude: number;
          location_address: string | null;
          media_urls: string[];
          is_anonymous: boolean;
          contact_phone: string | null;
          assigned_authority_id: string | null;
          acknowledged_at: string | null;
          resolved_at: string | null;
          escalation_count: number;
          tracking_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          incident_type: string;
          description: string;
          severity?: string;
          status?: string;
          latitude: number;
          longitude: number;
          location_address?: string | null;
          media_urls?: string[];
          is_anonymous?: boolean;
          contact_phone?: string | null;
          assigned_authority_id?: string | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          escalation_count?: number;
          tracking_token: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string | null;
          latitude: number;
          longitude: number;
          location_address: string | null;
          status: 'active' | 'responding' | 'resolved' | 'cancelled';
          tracking_token: string;
          audio_url: string | null;
          photo_url: string | null;
          assigned_authority_id: string | null;
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          latitude: number;
          longitude: number;
          location_address?: string | null;
          status?: string;
          tracking_token: string;
          audio_url?: string | null;
          photo_url?: string | null;
          assigned_authority_id?: string | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
