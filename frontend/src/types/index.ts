export interface Discount {
  type: 'percent' | 'fixed';
  value: number;
  applied_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  stock: number;
  price: number;
  finalPrice: number;
  is_out_of_stock: boolean;
  hasCouponApplied: boolean;
  discount: Discount | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}