import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlitePath = path.resolve(dbDir, 'onemarket.db');
const sqlite = new Database(sqlitePath);

// Enable WAL mode for high concurrent read/write performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Auto-initialize tables if not already created
export function initDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      master_price INTEGER NOT NULL,
      master_stock INTEGER NOT NULL DEFAULT 0,
      weight INTEGER NOT NULL DEFAULT 100,
      length INTEGER DEFAULT 10,
      width INTEGER DEFAULT 10,
      height INTEGER DEFAULT 10,
      category_id TEXT,
      variants TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      filename TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS channel_publications (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      external_product_id TEXT,
      external_url TEXT,
      price_adjustment INTEGER DEFAULT 0,
      last_sync_at TEXT,
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      shopee_category_id TEXT,
      shopee_category_name TEXT,
      tokopedia_category_id TEXT,
      tokopedia_category_name TEXT,
      olx_category_id TEXT,
      olx_category_name TEXT,
      default_attributes TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS channel_configs (
      channel TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      is_enabled INTEGER NOT NULL DEFAULT 0,
      is_sandbox INTEGER NOT NULL DEFAULT 1,
      shop_id TEXT,
      api_key TEXT,
      api_secret TEXT,
      access_token TEXT,
      extra_config TEXT DEFAULT '{}',
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default channels if empty
  const existingChannels = sqlite.prepare('SELECT COUNT(*) as count FROM channel_configs').get() as { count: number };
  if (existingChannels.count === 0) {
    const insertChannel = sqlite.prepare(`
      INSERT INTO channel_configs (channel, display_name, is_enabled, is_sandbox, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insertChannel.run('shopee', 'Shopee Indonesia', 1, 0, now);
    insertChannel.run('tokopedia', 'Tokopedia / TikTok Shop', 1, 0, now);
    insertChannel.run('olx', 'OLX Indonesia', 1, 1, now);
  }

  // Seed default sample category if empty
  const existingCategories = sqlite.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (existingCategories.count === 0) {
    const insertCategory = sqlite.prepare(`
      INSERT INTO categories (id, name, shopee_category_id, shopee_category_name, tokopedia_category_id, tokopedia_category_name, olx_category_id, olx_category_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insertCategory.run(
      'cat_fashion_pria',
      'Pakaian Pria',
      '10001',
      'Fashion Pria > Kaos & Atasan',
      '20001',
      'Fashion Pria > Pakaian Pria > Kaos',
      'olx_fashion',
      'Fashion & Aksesoris > Pakaian Pria',
      now
    );
    insertCategory.run(
      'cat_elektronik',
      'Elektronik Rumah Tangga',
      '10002',
      'Elektronik > Peralatan Rumah Tangga',
      '20002',
      'Elektronik > Rumah Tangga',
      'olx_elektronik',
      'Elektronik & Gadget',
      now
    );
  }
}
