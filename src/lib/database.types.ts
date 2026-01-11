export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vital_types: {
        Row: {
          id: string;
          name: string;
          unit: string;
          description: string | null;
          normal_range_min: number | null;
          normal_range_max: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          unit: string;
          description?: string | null;
          normal_range_min?: number | null;
          normal_range_max?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          unit?: string;
          description?: string | null;
          normal_range_min?: number | null;
          normal_range_max?: number | null;
          created_at?: string;
        };
      };
      vitals: {
        Row: {
          id: string;
          user_id: string;
          vital_type_id: string;
          value: number;
          measured_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vital_type_id: string;
          value: number;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vital_type_id?: string;
          value?: number;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          report_type: string;
          file_path: string;
          file_type: string;
          file_size: number;
          report_date: string;
          description: string | null;
          vital_type_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          report_type: string;
          file_path: string;
          file_type: string;
          file_size: number;
          report_date: string;
          description?: string | null;
          vital_type_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          report_type?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          report_date?: string;
          description?: string | null;
          vital_type_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      report_shares: {
        Row: {
          id: string;
          report_id: string;
          owner_id: string;
          shared_with_id: string;
          access_level: string;
          shared_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          report_id: string;
          owner_id: string;
          shared_with_id: string;
          access_level?: string;
          shared_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          report_id?: string;
          owner_id?: string;
          shared_with_id?: string;
          access_level?: string;
          shared_at?: string;
          expires_at?: string | null;
        };
      };
    };
  };
}
