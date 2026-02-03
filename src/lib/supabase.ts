import { createClient } from '@supabase/supabase-js';

// Validar que las variables de entorno existan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. ' +
    'Asegurate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local'
  );
}

// Cliente de Supabase para operaciones del lado del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types para TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
          dni: string | null;
          pais: string | null;
          provincia: string | null;
          localidad: string | null;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string;
          detailed_description: string | null;
          price: number;
          original_price: number | null;
          category: string;
          stock: number;
          image_url: string | null;
          video_url: string | null;
          features: string[] | null;
          status: 'active' | 'inactive' | 'draft';
          is_new: boolean;
          sales: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      courses: {
        Row: {
          id: number;
          title: string;
          description: string;
          detailed_description: string | null;
          instructor: string;
          price: number;
          original_price: number | null;
          level: 'Básico' | 'Intermedio' | 'Avanzado';
          duration: string;
          lessons: number;
          image_url: string | null;
          video_url: string | null;
          topics: string[] | null;
          includes: string[] | null;
          category: string;
          students: number;
          rating: number;
          status: 'active' | 'inactive' | 'draft';
          is_new: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      orders: {
        Row: {
          id: number;
          user_id: string | null;
          user_email: string;
          user_name: string | null;
          user_dni: string | null;
          user_pais: string | null;
          user_provincia: string | null;
          user_localidad: string | null;
          total: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id: string | null;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number | null;
          course_id: number | null;
          item_type: 'product' | 'course';
          item_name: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
  };
};
