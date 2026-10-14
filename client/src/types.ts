export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  filename: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ChannelPublication {
  id: string;
  productId: string;
  channel: 'shopee' | 'tokopedia' | 'olx';
  status: 'draft' | 'queued' | 'publishing' | 'published' | 'failed';
  externalProductId?: string;
  externalUrl?: string;
  priceAdjustment?: number;
  lastSyncAt?: string;
  errorMessage?: string;
  retryCount: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  masterPrice: number;
  masterStock: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId?: string;
  variants?: string;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  publications?: ChannelPublication[];
}

export interface Category {
  id: string;
  name: string;
  shopeeCategoryId?: string;
  shopeeCategoryName?: string;
  tokopediaCategoryId?: string;
  tokopediaCategoryName?: string;
  olxCategoryId?: string;
  olxCategoryName?: string;
}

export interface ChannelConfig {
  channel: 'shopee' | 'tokopedia' | 'olx';
  displayName: string;
  isEnabled: boolean;
  isSandbox: boolean;
  shopId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  extraConfig?: any;
}

export interface DashboardStats {
  totalProducts: number;
  totalPublished: number;
  totalQueued: number;
  totalFailed: number;
  byChannel: {
    shopee: { published: number; total: number };
    tokopedia: { published: number; total: number };
    olx: { published: number; total: number };
  };
  queue: {
    size: number;
    pending: number;
  };
}
