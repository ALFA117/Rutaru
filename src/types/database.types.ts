// Generado a mano a partir de supabase/migrations/0001-0009 (sin Docker/Podman
// disponible para `supabase gen types` via contenedor). Regenerar si el esquema
// cambia. Estructura compatible con el output estandar de `supabase gen types`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          nombre: string | null;
          email: string | null;
          telefono: string | null;
          avatar: string | null;
          empresa: string | null;
          pais: string | null;
          ciudad: string | null;
          verificado: boolean;
          consiente_datos_agregados: boolean;
          consentimiento_hash: string | null;
          consentimiento_tx_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          nombre?: string | null;
          email?: string | null;
          telefono?: string | null;
          avatar?: string | null;
          empresa?: string | null;
          pais?: string | null;
          ciudad?: string | null;
          verificado?: boolean;
          consiente_datos_agregados?: boolean;
          consentimiento_hash?: string | null;
          consentimiento_tx_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      operadores: {
        Row: {
          id: string;
          user_id: string;
          tipo: string;
          nombre: string | null;
          descripcion: string | null;
          logo: string | null;
          slug: string;
          wallet_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo: string;
          nombre?: string | null;
          descripcion?: string | null;
          logo?: string | null;
          slug: string;
          wallet_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["operadores"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "operadores_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      agencias: {
        Row: {
          id: string;
          user_id: string;
          razon_social: string;
          pais: string | null;
          nivel_b2b: string | null;
          markup_default: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razon_social: string;
          pais?: string | null;
          nivel_b2b?: string | null;
          markup_default?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agencias"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "agencias_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      afiliados: {
        Row: {
          id: string;
          user_id: string;
          codigo_5: string;
          codigo_10: string;
          comision_pct: number;
          saldo: number;
          pago_solicitado_at: string | null;
          wallet_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          codigo_5: string;
          codigo_10: string;
          comision_pct?: number;
          saldo?: number;
          pago_solicitado_at?: string | null;
          wallet_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["afiliados"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "afiliados_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          id: string;
          operador_id: string;
          tipo: Database["public"]["Enums"]["listing_tipo"];
          titulo: string;
          slug: string;
          descripcion: string | null;
          itinerario: Json;
          que_incluye: string[];
          cancelaciones: string | null;
          dificultad: string | null;
          pais: string | null;
          estado: string | null;
          ciudad: string | null;
          precio_b2c: number;
          precio_neto_b2b: number | null;
          moneda: string;
          duracion: string | null;
          ubicacion: string | null;
          lat: number | null;
          lng: number | null;
          imagenes: string[];
          cupo: number | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          operador_id: string;
          tipo: Database["public"]["Enums"]["listing_tipo"];
          titulo: string;
          slug: string;
          descripcion?: string | null;
          itinerario?: Json;
          que_incluye?: string[];
          cancelaciones?: string | null;
          dificultad?: string | null;
          pais?: string | null;
          estado?: string | null;
          ciudad?: string | null;
          precio_b2c: number;
          precio_neto_b2b?: number | null;
          moneda?: string;
          duracion?: string | null;
          ubicacion?: string | null;
          lat?: number | null;
          lng?: number | null;
          imagenes?: string[];
          cupo?: number | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "listings_operador_id_fkey";
            columns: ["operador_id"];
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
      disponibilidad: {
        Row: {
          id: string;
          listing_id: string;
          fecha: string;
          cupo_disponible: number;
          precio_override: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          fecha: string;
          cupo_disponible: number;
          precio_override?: number | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["disponibilidad"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "disponibilidad_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      paquetes: {
        Row: {
          id: string;
          agencia_id: string;
          titulo: string;
          slug: string;
          componentes: Json;
          precio_total: number;
          markup_pct: number;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          pais: string | null;
          estado: string | null;
          ciudad: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agencia_id: string;
          titulo: string;
          slug: string;
          componentes?: Json;
          precio_total: number;
          markup_pct?: number;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          pais?: string | null;
          estado?: string | null;
          ciudad?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["paquetes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "paquetes_agencia_id_fkey";
            columns: ["agencia_id"];
            referencedRelation: "agencias";
            referencedColumns: ["id"];
          },
        ];
      };
      carritos: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["carritos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "carritos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      carrito_items: {
        Row: {
          id: string;
          carrito_id: string;
          listing_id: string | null;
          paquete_id: string | null;
          cantidad: number;
          fecha_servicio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          carrito_id: string;
          listing_id?: string | null;
          paquete_id?: string | null;
          cantidad?: number;
          fecha_servicio?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["carrito_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "carrito_items_carrito_id_fkey";
            columns: ["carrito_id"];
            referencedRelation: "carritos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "carrito_items_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "carrito_items_paquete_id_fkey";
            columns: ["paquete_id"];
            referencedRelation: "paquetes";
            referencedColumns: ["id"];
          },
        ];
      };
      ordenes: {
        Row: {
          id: string;
          user_id: string;
          tipo: Database["public"]["Enums"]["orden_tipo"];
          subtotal: number;
          descuento: number;
          codigo_afiliado: string | null;
          total: number;
          estado: Database["public"]["Enums"]["orden_estado"];
          metodo_pago: string | null;
          tx_hash_blockchain: string | null;
          reserva_id_blockchain: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo?: Database["public"]["Enums"]["orden_tipo"];
          subtotal: number;
          descuento?: number;
          codigo_afiliado?: string | null;
          total: number;
          estado?: Database["public"]["Enums"]["orden_estado"];
          metodo_pago?: string | null;
          tx_hash_blockchain?: string | null;
          reserva_id_blockchain?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ordenes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "ordenes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orden_items: {
        Row: {
          id: string;
          orden_id: string;
          listing_id: string | null;
          paquete_id: string | null;
          cantidad: number;
          fecha_servicio: string | null;
          precio: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          orden_id: string;
          listing_id?: string | null;
          paquete_id?: string | null;
          cantidad?: number;
          fecha_servicio?: string | null;
          precio: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["orden_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "orden_items_orden_id_fkey";
            columns: ["orden_id"];
            referencedRelation: "ordenes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orden_items_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orden_items_paquete_id_fkey";
            columns: ["paquete_id"];
            referencedRelation: "paquetes";
            referencedColumns: ["id"];
          },
        ];
      };
      pagos: {
        Row: {
          id: string;
          orden_id: string;
          pasarela: string;
          referencia: string | null;
          estado: Database["public"]["Enums"]["pago_estado"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          orden_id: string;
          pasarela?: string;
          referencia?: string | null;
          estado?: Database["public"]["Enums"]["pago_estado"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pagos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "pagos_orden_id_fkey";
            columns: ["orden_id"];
            referencedRelation: "ordenes";
            referencedColumns: ["id"];
          },
        ];
      };
      comisiones_afiliado: {
        Row: {
          id: string;
          afiliado_id: string;
          orden_id: string;
          monto: number;
          estado: Database["public"]["Enums"]["comision_estado"];
          tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          afiliado_id: string;
          orden_id: string;
          monto: number;
          estado?: Database["public"]["Enums"]["comision_estado"];
          tx_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["comisiones_afiliado"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "comisiones_afiliado_afiliado_id_fkey";
            columns: ["afiliado_id"];
            referencedRelation: "afiliados";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comisiones_afiliado_orden_id_fkey";
            columns: ["orden_id"];
            referencedRelation: "ordenes";
            referencedColumns: ["id"];
          },
        ];
      };
      resenas: {
        Row: {
          id: string;
          listing_id: string;
          user_id: string;
          rating: number;
          comentario: string | null;
          autor_nombre: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          user_id: string;
          rating: number;
          comentario?: string | null;
          autor_nombre?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resenas"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "resenas_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resenas_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events_tracking: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          tipo_evento: string;
          entidad: string | null;
          metadata: Json;
          dispositivo: string | null;
          ciudad: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id: string;
          tipo_evento: string;
          entidad?: string | null;
          metadata?: Json;
          dispositivo?: string | null;
          ciudad?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["events_tracking"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "events_tracking_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_insights: {
        Row: {
          id: string;
          tipo: string;
          titulo: string;
          resumen: string | null;
          data: Json;
          generado_por: string;
          periodo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipo: string;
          titulo: string;
          resumen?: string | null;
          data?: Json;
          generado_por?: string;
          periodo?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["ai_insights"]["Insert"]
        >;
        Relationships: [];
      };
      data_packages: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string | null;
          precio: number;
          preview: Json;
          dataset_url: string | null;
          comprador_empresa: string | null;
          estado: Database["public"]["Enums"]["data_package_estado"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descripcion?: string | null;
          precio: number;
          preview?: Json;
          dataset_url?: string | null;
          comprador_empresa?: string | null;
          estado?: Database["public"]["Enums"]["data_package_estado"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["data_packages"]["Insert"]
        >;
        Relationships: [];
      };
      nft_tickets: {
        Row: {
          id: string;
          orden_item_id: string;
          contract_address: string | null;
          token_id: number | null;
          tx_hash: string | null;
          wallet: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          orden_item_id: string;
          contract_address?: string | null;
          token_id?: number | null;
          tx_hash?: string | null;
          wallet?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["nft_tickets"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "nft_tickets_orden_item_id_fkey";
            columns: ["orden_item_id"];
            referencedRelation: "orden_items";
            referencedColumns: ["id"];
          },
        ];
      };
      articulos: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          extracto: string | null;
          contenido: string;
          imagen: string | null;
          categoria: string | null;
          listing_id: string | null;
          autor: string | null;
          publicado_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          extracto?: string | null;
          contenido: string;
          imagen?: string | null;
          categoria?: string | null;
          listing_id?: string | null;
          autor?: string | null;
          publicado_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articulos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "articulos_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      agencias_publico: {
        Row: {
          id: string;
          razon_social: string;
          pais: string | null;
        };
        Relationships: [];
      };
      listings_publico: {
        Row: {
          id: string;
          operador_id: string;
          tipo: Database["public"]["Enums"]["listing_tipo"];
          titulo: string;
          slug: string;
          descripcion: string | null;
          itinerario: Json;
          que_incluye: string[];
          cancelaciones: string | null;
          dificultad: string | null;
          pais: string | null;
          estado: string | null;
          ciudad: string | null;
          precio_b2c: number;
          moneda: string;
          duracion: string | null;
          ubicacion: string | null;
          lat: number | null;
          lng: number | null;
          imagenes: string[];
          cupo: number | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
          rating_promedio: number | null;
          rating_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "listings_operador_id_fkey";
            columns: ["operador_id"];
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      get_user_role: {
        Args: { user_id: string };
        Returns: Database["public"]["Enums"]["user_role"];
      };
    };
    Enums: {
      user_role: "operador" | "agencia" | "admin" | "afiliado" | "cliente";
      listing_tipo:
        | "ruta"
        | "hospedaje"
        | "traslado"
        | "evento"
        | "experiencia";
      orden_tipo: "b2b" | "b2c";
      orden_estado:
        | "pendiente"
        | "confirmada"
        | "pagada"
        | "cancelada"
        | "completada";
      pago_estado: "pendiente" | "aprobado" | "rechazado" | "reembolsado";
      comision_estado: "pendiente" | "pagada";
      data_package_estado: "borrador" | "publicado" | "vendido";
    };
  };
};
