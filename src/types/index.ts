export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  material: string | null;
  lead_time: string | null;
  availability: string;
  custom_printing: boolean;
  design_support: boolean;
  starting_price: number;
  moq: number;
  is_popular: boolean;
  is_custom_printed: boolean;
  is_essential: boolean;
  display_order: number;
  created_at: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  quantity_tiers?: QuantityTier[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  sku: string | null;
  price: number | null;
  moq_override: number | null;
  availability: string | null;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
  variant_id: string | null;
  created_at: string;
}

export interface QuantityTier {
  id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  business_name: string | null;
  gst_number: string | null;
  phone: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  business_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  payment_method: string | null;
  order_notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_type: string | null;
  variant_value: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  customisation_option: string | null;
  artwork_url: string | null;
  artwork_status: string;
  created_at: string;
}

export interface DesignRequest {
  id: string;
  user_id: string;
  product_id: string | null;
  order_item_id: string | null;
  option_type: 'custom_design' | 'upload_design' | 'logo_only';
  business_name: string | null;
  brand_colours: string | null;
  design_style: string | null;
  text_content: string | null;
  additional_instructions: string | null;
  logo_url: string | null;
  artwork_url: string | null;
  reference_images: string[] | null;
  status: string;
  assigned_designer: string | null;
  created_at: string;
  updated_at: string;
  design_versions?: DesignVersion[];
}

export interface DesignVersion {
  id: string;
  design_request_id: string;
  version_number: number;
  image_url: string | null;
  designer_comments: string | null;
  customer_comments: string | null;
  status: 'pending' | 'approved' | 'changes_requested';
  created_at: string;
}

export interface BulkQuote {
  id: string;
  user_id: string | null;
  business_name: string | null;
  contact_name: string;
  phone: string;
  email: string;
  product_id: string | null;
  variant_value: string | null;
  quantity: number | null;
  material: string | null;
  size: string | null;
  printing_requirements: string | null;
  delivery_location: string | null;
  required_date: string | null;
  reference: string | null;
  upload_url: string | null;
  additional_requirements: string | null;
  status: string;
  created_at: string;
}

export interface CustomPackagingRequest {
  id: string;
  user_id: string | null;
  product_type: string;
  desired_size: string | null;
  quantity: number | null;
  material_preference: string | null;
  branding_requirements: string | null;
  artwork_url: string | null;
  reference_images: string[] | null;
  delivery_requirements: string | null;
  status: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface SavedDesign {
  id: string;
  user_id: string;
  design_request_id: string | null;
  name: string;
  image_url: string | null;
  product_id: string | null;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  variant_id: string;
  variant_type: string;
  variant_value: string;
  quantity: number;
  unit_price: number;
  customisation_option: string;
  customisation_data: Record<string, string>;
  artwork_url: string | null;
  artwork_status: string;
  delivery_estimate: string;
}

export const DEFAULT_QUANTITY_TIERS = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

export const ORDER_STATUSES = [
  'Confirmed',
  'Design',
  'Approval',
  'Production',
  'Dispatch',
  'Delivered',
] as const;

export const DESIGN_STATUSES = [
  'Request Received',
  'Designer Assigned',
  'Design In Progress',
  'Ready For Approval',
  'Approved For Production',
] as const;
