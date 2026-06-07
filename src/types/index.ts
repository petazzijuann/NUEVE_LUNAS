export type NLCategory =
  | "almohadones"
  | "mantas"
  | "reductores"
  | "nidos"
  | "cambiadores"
  | "colchones"
  | "sets"
  | "toallon";

export const NL_CATEGORIES: { value: NLCategory; label: string }[] = [
  { value: "almohadones", label: "Almohadones" },
  { value: "mantas",      label: "Mantas" },
  { value: "reductores",  label: "Reductores" },
  { value: "nidos",       label: "Nidos" },
  { value: "cambiadores", label: "Cambiadores" },
  { value: "colchones",   label: "Colchones" },
  { value: "sets",        label: "Sets" },
  { value: "toallon",     label: "Toallón" },
];

export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "astropay" | "transfer";

export type SaleChannel = "online" | "offline";

// Stock por color: cada variante tiene nombre, imágenes y cantidad
export interface ColorVariant {
  name: string;
  images: string[];
  stock: number;
}

export interface ProductPublic {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: NLCategory;
  images: string[];
  tags: string[];
  price_sale: number;
  color_variants: ColorVariant[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductAdmin extends ProductPublic {
  price_cost: number;
  weight_kg: number | null;
}

// Ítems del pedido: sin talle, solo color
export interface OrderItem {
  product_id: string;
  slug: string;
  name: string;
  color: string;
  qty: number;
  price: number;
}

export interface CustomerAddress {
  street: string;
  city: string;
  province: string;
  zip: string;
}

export interface OrderPublic {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: CustomerAddress;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  astropay_payment_id: string | null;
  coupon_code: string | null;
  discount_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface SaleRecord {
  id: string;
  product_id: string;
  product_name: string;
  color: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
  channel: SaleChannel;
  payment_method: string;
  order_id: string | null;
  customer_note: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  period: "today" | "week" | "month" | "all";
  revenue: number;
  cogs: number;
  profit: number;
  margin_avg: number;
  sales_count: number;
  stock_value_cost: number;
  stock_value_sale: number;
  top_products: Array<{
    name: string;
    units_sold: number;
    profit_total: number;
    margin: number;
  }>;
  low_stock: Array<{
    name: string;
    color_variants: ColorVariant[];
    total_units: number;
  }>;
  sales_by_day: Array<{
    date: string;
    revenue: number;
    profit: number;
  }>;
}

export interface CouponPublic {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number | null;
  stock: number;
  used_count: number;
  min_purchase: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponValidated {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number | null;
  discount_amount: number;
}

export interface TransferInfo {
  cbu: string;
  alias: string;
  titular: string;
  amount: number;
}

export interface CreateOrderResponse {
  order_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_url?: string;
  transfer_info?: TransferInfo;
}

// Item del carrito: sin talle, solo color (mínimo 3 unidades)
export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  price: number;
  quantity: number;
}

// Reglas de negocio mayorista
export const WHOLESALE_MIN_UNITS_PER_ITEM = 3;
export const WHOLESALE_MIN_ORDER_TOTAL = 300_000;
