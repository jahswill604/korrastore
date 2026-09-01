// lib/supabase/types.ts — Complete Supabase TypeScript type definitions for KorraStore.
// Defines all database tables, views, enums, functions, and composite types.
// Used across: Server Components, Client Components, Server Actions, and Domain Services.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'sourcing'
  | 'in_transit'
  | 'stored'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type DeliveryType = 'storage' | 'home_delivery';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned';

export type ResaleStatus = 'active' | 'sold' | 'cancelled' | 'expired';

export type BuybackStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export type HoldingMovementType =
  | 'purchase'
  | 'resale_lock'
  | 'resale_release'
  | 'resale_sold'
  | 'buyback_lock'
  | 'buyback_release'
  | 'buyback_sold'
  | 'delivery_out'
  | 'transfer_in'
  | 'transfer_out';

export type NotificationChannel = 'email' | 'sms' | 'in_app';

export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      commodities: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          unit: string;
          base_price: number;
          current_price: number;
          image_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          unit?: string;
          base_price: number;
          current_price: number;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          unit?: string;
          base_price?: number;
          current_price?: number;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      commodity_grades: {
        Row: {
          id: string;
          commodity_id: string;
          code: string;
          name: string;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          commodity_id: string;
          code: string;
          name: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          commodity_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      warehouses: {
        Row: {
          id: string;
          code: string;
          name: string;
          location: string;
          address: string;
          capacity: number;
          contact_info: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          location: string;
          address: string;
          capacity?: number;
          contact_info?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          location?: string;
          address?: string;
          capacity?: number;
          contact_info?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          warehouse_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          allocated_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          commodity_id: string;
          grade_id: string;
          quantity?: number;
          allocated_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          warehouse_id?: string;
          commodity_id?: string;
          grade_id?: string;
          quantity?: number;
          allocated_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          warehouse_id: string;
          commodity_id: string;
          grade_id: string;
          movement_type: string;
          quantity: number;
          balance_after: number;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          commodity_id: string;
          grade_id: string;
          movement_type: string;
          quantity: number;
          balance_after: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          warehouse_id?: string;
          commodity_id?: string;
          grade_id?: string;
          movement_type?: string;
          quantity?: number;
          balance_after?: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: OrderStatus;
          delivery_type: DeliveryType;
          delivery_address: Json | null;
          total_amount: number;
          subtotal: number;
          storage_fee: number;
          delivery_fee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: OrderStatus;
          delivery_type?: DeliveryType;
          delivery_address?: Json | null;
          total_amount: number;
          subtotal: number;
          storage_fee?: number;
          delivery_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: OrderStatus;
          delivery_type?: DeliveryType;
          delivery_address?: Json | null;
          total_amount?: number;
          subtotal?: number;
          storage_fee?: number;
          delivery_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          commodity_id?: string;
          grade_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          reference: string;
          amount: number;
          status: PaymentStatus;
          channel: string | null;
          paid_at: string | null;
          raw_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          reference: string;
          amount: number;
          status?: PaymentStatus;
          channel?: string | null;
          paid_at?: string | null;
          raw_payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          reference?: string;
          amount?: number;
          status?: PaymentStatus;
          channel?: string | null;
          paid_at?: string | null;
          raw_payload?: Json;
          created_at?: string;
        };
      };
      holdings: {
        Row: {
          id: string;
          user_id: string;
          commodity_id: string;
          grade_id: string;
          warehouse_id: string;
          quantity: number;
          reserved_quantity: number;
          cost_basis: number;
          unit_purchase_price: number;
          purchased_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          commodity_id: string;
          grade_id: string;
          warehouse_id: string;
          quantity?: number;
          reserved_quantity?: number;
          cost_basis?: number;
          unit_purchase_price: number;
          purchased_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          commodity_id?: string;
          grade_id?: string;
          warehouse_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          cost_basis?: number;
          unit_purchase_price?: number;
          purchased_at?: string;
          updated_at?: string;
        };
      };
      holding_movements: {
        Row: {
          id: string;
          holding_id: string;
          user_id: string;
          movement_type: HoldingMovementType;
          quantity: number;
          balance_after: number;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          holding_id: string;
          user_id: string;
          movement_type: HoldingMovementType;
          quantity: number;
          balance_after: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          holding_id?: string;
          user_id?: string;
          movement_type?: HoldingMovementType;
          quantity?: number;
          balance_after?: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          holding_id: string;
          order_id: string;
          user_id: string;
          receipt_number: string;
          document_url: string | null;
          metadata: Json;
          issued_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          holding_id: string;
          order_id: string;
          user_id: string;
          receipt_number: string;
          document_url?: string | null;
          metadata?: Json;
          issued_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          holding_id?: string;
          order_id?: string;
          user_id?: string;
          receipt_number?: string;
          document_url?: string | null;
          metadata?: Json;
          issued_at?: string;
          created_at?: string;
        };
      };
      resale_listings: {
        Row: {
          id: string;
          holding_id: string;
          seller_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          unit_price: number;
          status: ResaleStatus;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          holding_id: string;
          seller_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          unit_price: number;
          status?: ResaleStatus;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          holding_id?: string;
          seller_id?: string;
          commodity_id?: string;
          grade_id?: string;
          quantity?: number;
          unit_price?: number;
          status?: ResaleStatus;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resale_transactions: {
        Row: {
          id: string;
          listing_id: string;
          holding_id: string;
          seller_id: string;
          buyer_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          platform_fee: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          holding_id: string;
          seller_id: string;
          buyer_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          platform_fee?: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          holding_id?: string;
          seller_id?: string;
          buyer_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          platform_fee?: number;
          completed_at?: string;
          created_at?: string;
        };
      };
      buyback_requests: {
        Row: {
          id: string;
          holding_id: string;
          user_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          offered_price: number;
          total_amount: number;
          status: BuybackStatus;
          admin_notes: string | null;
          requested_at: string;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          holding_id: string;
          user_id: string;
          commodity_id: string;
          grade_id: string;
          quantity: number;
          offered_price: number;
          total_amount: number;
          status?: BuybackStatus;
          admin_notes?: string | null;
          requested_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          holding_id?: string;
          user_id?: string;
          commodity_id?: string;
          grade_id?: string;
          quantity?: number;
          offered_price?: number;
          total_amount?: number;
          status?: BuybackStatus;
          admin_notes?: string | null;
          requested_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          commodity_id: string;
          grade_id: string;
          price: number;
          change_reason: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          commodity_id: string;
          grade_id: string;
          price: number;
          change_reason?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          commodity_id?: string;
          grade_id?: string;
          price?: number;
          change_reason?: string | null;
          recorded_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          channel: NotificationChannel;
          title: string;
          body: string;
          status: NotificationStatus;
          payload: Json;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel: NotificationChannel;
          title: string;
          body: string;
          status?: NotificationStatus;
          payload?: Json;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          channel?: NotificationChannel;
          title?: string;
          body?: string;
          status?: NotificationStatus;
          payload?: Json;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      resale_listings_public: {
        Row: {
          id: string;
          holding_id: string;
          commodity_id: string;
          commodity_name: string;
          commodity_code: string;
          commodity_unit: string;
          commodity_image_url: string | null;
          grade_id: string;
          grade_code: string;
          grade_name: string;
          warehouse_id: string;
          warehouse_name: string;
          warehouse_location: string;
          quantity: number;
          unit_price: number;
          total_listing_price: number;
          benchmark_market_price: number;
          price_delta_percentage: number;
          seller_display_name: string;
          status: ResaleStatus;
          expires_at: string | null;
          created_at: string;
        };
      };
      holdings_with_current_value: {
        Row: {
          id: string;
          user_id: string;
          commodity_id: string;
          commodity_name: string;
          commodity_code: string;
          commodity_unit: string;
          commodity_image_url: string | null;
          grade_id: string;
          grade_code: string;
          grade_name: string;
          warehouse_id: string;
          warehouse_name: string;
          warehouse_location: string;
          quantity: number;
          reserved_quantity: number;
          available_quantity: number;
          unit_purchase_price: number;
          total_cost_basis: number;
          current_unit_price: number;
          current_total_value: number;
          profit_loss: number;
          profit_loss_percentage: number;
          purchased_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      reserve_holding_quantity: {
        Args: {
          p_holding_id: string;
          p_quantity: number;
        };
        Returns: void;
      };
      release_holding_quantity: {
        Args: {
          p_holding_id: string;
          p_quantity: number;
        };
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      delivery_type: DeliveryType;
      payment_status: PaymentStatus;
      resale_status: ResaleStatus;
      buyback_status: BuybackStatus;
      holding_movement_type: HoldingMovementType;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
    };
  };
}

// Utility Table Row, Insert, and Update helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];
