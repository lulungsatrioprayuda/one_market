import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(), // UUID or nanoid
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  masterPrice: integer('master_price').notNull(), // in IDR (Rupiah)
  masterStock: integer('master_stock').notNull().default(0),
  weight: integer('weight').notNull().default(100), // in grams (default 100g)
  length: integer('length').default(10), // in cm
  width: integer('width').default(10),   // in cm
  height: integer('height').default(10), // in cm
  categoryId: text('category_id'),
  variants: text('variants').default('[]'), // JSON array: [{ name: "Merah", price: 50000, stock: 10 }]
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  filename: text('filename').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const channelPublications = sqliteTable('channel_publications', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(), // 'shopee' | 'tokopedia' | 'olx'
  status: text('status').notNull().default('draft'), // 'draft' | 'queued' | 'publishing' | 'published' | 'failed'
  externalProductId: text('external_product_id'),
  externalUrl: text('external_url'),
  priceAdjustment: integer('price_adjustment').default(0), // markup in Rupiah or percentage
  lastSyncAt: text('last_sync_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  shopeeCategoryId: text('shopee_category_id'),
  shopeeCategoryName: text('shopee_category_name'),
  tokopediaCategoryId: text('tokopedia_category_id'),
  tokopediaCategoryName: text('tokopedia_category_name'),
  olxCategoryId: text('olx_category_id'),
  olxCategoryName: text('olx_category_name'),
  defaultAttributes: text('default_attributes').default('{}'), // JSON object for common attributes
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const channelConfigs = sqliteTable('channel_configs', {
  channel: text('channel').primaryKey(), // 'shopee' | 'tokopedia' | 'olx'
  displayName: text('display_name').notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(false),
  isSandbox: integer('is_sandbox', { mode: 'boolean' }).notNull().default(true),
  shopId: text('shop_id'),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  accessToken: text('access_token'),
  extraConfig: text('extra_config').default('{}'), // JSON for custom platform settings
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
