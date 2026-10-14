import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initDatabase, db } from './db/index.js';
import { products, productImages, channelPublications, categories, channelConfigs } from './db/schema.js';
import { publishQueue } from './services/queue.js';
import { processPublishJob } from './services/publisher.js';

// Initialize DB schema & seeds
initDatabase();

const app = new Hono();

// Middlewares
app.use('*', cors());

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded static files
app.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return c.text('File Not Found', 404);
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };

  const buffer = fs.readFileSync(filePath);
  return c.body(buffer, 200, {
    'Content-Type': mimeMap[ext] || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000',
  });
});

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    queue: {
      size: publishQueue.size,
      pending: publishQueue.pending,
    },
  });
});

// Image Upload Endpoint
app.post('/api/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Tidak ada file gambar yang diunggah' }, 400);
    }

    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    const uniqueName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const destination = path.join(uploadsDir, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(destination, Buffer.from(arrayBuffer));

    return c.json({
      success: true,
      filename: uniqueName,
      url: `/uploads/${uniqueName}`,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return c.json({ error: err.message || 'Gagal mengunggah file' }, 500);
  }
});

// Dashboard Stats Endpoint
app.get('/api/stats', (c) => {
  const allProducts = db.select().from(products).all();
  const allPubs = db.select().from(channelPublications).all();

  const stats = {
    totalProducts: allProducts.length,
    totalPublished: allPubs.filter((p) => p.status === 'published').length,
    totalQueued: allPubs.filter((p) => p.status === 'queued' || p.status === 'publishing').length,
    totalFailed: allPubs.filter((p) => p.status === 'failed').length,
    byChannel: {
      shopee: {
        published: allPubs.filter((p) => p.channel === 'shopee' && p.status === 'published').length,
        total: allPubs.filter((p) => p.channel === 'shopee').length,
      },
      tokopedia: {
        published: allPubs.filter((p) => p.channel === 'tokopedia' && p.status === 'published').length,
        total: allPubs.filter((p) => p.channel === 'tokopedia').length,
      },
      olx: {
        published: allPubs.filter((p) => p.channel === 'olx' && p.status === 'published').length,
        total: allPubs.filter((p) => p.channel === 'olx').length,
      },
    },
    queue: {
      size: publishQueue.size,
      pending: publishQueue.pending,
    },
  };

  return c.json(stats);
});

// Products: List with images and channel publication statuses
app.get('/api/products', (c) => {
  const productList = db.select().from(products).orderBy(desc(products.createdAt)).all();

  const results = productList.map((p) => {
    const images = db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, p.id))
      .orderBy(productImages.sortOrder)
      .all();

    const publications = db
      .select()
      .from(channelPublications)
      .where(eq(channelPublications.productId, p.id))
      .all();

    return {
      ...p,
      images,
      publications,
    };
  });

  return c.json(results);
});

// Products: Detail
app.get('/api/products/:id', (c) => {
  const id = c.req.param('id');
  const product = db.select().from(products).where(eq(products.id, id)).get();

  if (!product) {
    return c.json({ error: 'Produk tidak ditemukan' }, 404);
  }

  const images = db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.sortOrder)
    .all();

  const publications = db
    .select()
    .from(channelPublications)
    .where(eq(channelPublications.productId, product.id))
    .all();

  return c.json({
    ...product,
    images,
    publications,
  });
});

// Products: Create
app.post('/api/products', async (c) => {
  try {
    const data = await c.req.json();
    const {
      name,
      sku,
      description,
      masterPrice,
      masterStock,
      weight,
      length,
      width,
      height,
      categoryId,
      images = [],
      channels = ['shopee', 'tokopedia', 'olx'],
      autoPublish = true,
    } = data;

    if (!name || !name.trim()) {
      return c.json({ error: 'Nama produk wajib diisi' }, 400);
    }

    const productId = `prod_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const generatedSku = sku && sku.trim() 
      ? sku.trim().toUpperCase() 
      : `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

    const now = new Date().toISOString();

    db.insert(products)
      .values({
        id: productId,
        sku: generatedSku,
        name: name.trim(),
        description: description || '',
        masterPrice: Number(masterPrice) || 0,
        masterStock: Number(masterStock) || 0,
        weight: Number(weight) || 200,
        length: Number(length) || 10,
        width: Number(width) || 10,
        height: Number(height) || 10,
        categoryId: categoryId || null,
        variants: JSON.stringify(data.variants || []),
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img: any, idx: number) => {
        db.insert(productImages)
          .values({
            id: `img_${Date.now()}_${idx}`,
            productId,
            url: img.url,
            filename: img.filename || path.basename(img.url),
            sortOrder: idx,
            isPrimary: idx === 0,
            createdAt: now,
          })
          .run();
      });
    }

    // Insert Publications per targeted channel
    const queuedPubIds: string[] = [];
    if (Array.isArray(channels)) {
      channels.forEach((ch: string) => {
        const pubId = `pub_${productId}_${ch}`;
        db.insert(channelPublications)
          .values({
            id: pubId,
            productId,
            channel: ch,
            status: autoPublish ? 'queued' : 'draft',
            createdAt: now,
            updatedAt: now,
          })
          .run();

        if (autoPublish) {
          queuedPubIds.push(pubId);
        }
      });
    }

    // Schedule background queue publish jobs
    if (autoPublish && queuedPubIds.length > 0) {
      for (const pubId of queuedPubIds) {
        publishQueue.add(() => processPublishJob(pubId));
      }
    }

    return c.json({
      success: true,
      message: 'Produk berhasil dibuat dan siap dipublikasikan',
      productId,
      sku: generatedSku,
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return c.json({ error: err.message || 'Gagal membuat produk' }, 500);
  }
});

// Products: Update
app.put('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = db.select().from(products).where(eq(products.id, id)).get();
  if (!existing) {
    return c.json({ error: 'Produk tidak ditemukan' }, 404);
  }

  db.update(products)
    .set({
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      masterPrice: data.masterPrice !== undefined ? Number(data.masterPrice) : existing.masterPrice,
      masterStock: data.masterStock !== undefined ? Number(data.masterStock) : existing.masterStock,
      weight: data.weight !== undefined ? Number(data.weight) : existing.weight,
      length: data.length !== undefined ? Number(data.length) : existing.length,
      width: data.width !== undefined ? Number(data.width) : existing.width,
      height: data.height !== undefined ? Number(data.height) : existing.height,
      categoryId: data.categoryId ?? existing.categoryId,
      updatedAt: now,
    })
    .where(eq(products.id, id))
    .run();

  return c.json({ success: true, message: 'Produk berhasil diperbarui' });
});

// Products: Delete
app.delete('/api/products/:id', (c) => {
  const id = c.req.param('id');
  db.delete(products).where(eq(products.id, id)).run();
  return c.json({ success: true, message: 'Produk berhasil dihapus' });
});

// Trigger publish or retry for a product on specific/all channels
app.post('/api/products/:id/publish', async (c) => {
  const productId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const targetChannel = body.channel; // optional: 'shopee' | 'tokopedia' | 'olx'

  const product = db.select().from(products).where(eq(products.id, productId)).get();
  if (!product) {
    return c.json({ error: 'Produk tidak ditemukan' }, 404);
  }

  let publications = db
    .select()
    .from(channelPublications)
    .where(eq(channelPublications.productId, productId))
    .all();

  // If specific channel requested but not exists, create it
  if (targetChannel) {
    publications = publications.filter((p) => p.channel === targetChannel);
    if (publications.length === 0) {
      const pubId = `pub_${productId}_${targetChannel}`;
      const now = new Date().toISOString();
      db.insert(channelPublications)
        .values({
          id: pubId,
          productId,
          channel: targetChannel,
          status: 'queued',
          createdAt: now,
          updatedAt: now,
        })
        .run();
      publications = [db.select().from(channelPublications).where(eq(channelPublications.id, pubId)).get()!];
    }
  }

  const queuedIds: string[] = [];
  for (const pub of publications) {
    db.update(channelPublications)
      .set({
        status: 'queued',
        errorMessage: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(channelPublications.id, pub.id))
      .run();

    queuedIds.push(pub.id);
    publishQueue.add(() => processPublishJob(pub.id));
  }

  return c.json({
    success: true,
    message: `Memulai sinkronisasi untuk ${queuedIds.length} kanal`,
    queuedCount: queuedIds.length,
  });
});

// Categories Endpoints
app.get('/api/categories', (c) => {
  const list = db.select().from(categories).all();
  return c.json(list);
});

app.post('/api/categories', async (c) => {
  const data = await c.req.json();
  const id = data.id || `cat_${Date.now()}`;
  const now = new Date().toISOString();

  db.insert(categories)
    .values({
      id,
      name: data.name,
      shopeeCategoryId: data.shopeeCategoryId,
      shopeeCategoryName: data.shopeeCategoryName,
      tokopediaCategoryId: data.tokopediaCategoryId,
      tokopediaCategoryName: data.tokopediaCategoryName,
      olxCategoryId: data.olxCategoryId,
      olxCategoryName: data.olxCategoryName,
      defaultAttributes: JSON.stringify(data.defaultAttributes || {}),
      createdAt: now,
    })
    .run();

  return c.json({ success: true, id });
});

// Channels Configuration Endpoints
app.get('/api/channels', (c) => {
  const list = db.select().from(channelConfigs).all();
  return c.json(list);
});

app.put('/api/channels/:channel', async (c) => {
  const channel = c.req.param('channel');
  const data = await c.req.json();
  const now = new Date().toISOString();

  db.update(channelConfigs)
    .set({
      isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : undefined,
      isSandbox: data.isSandbox !== undefined ? Boolean(data.isSandbox) : undefined,
      shopId: data.shopId,
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      accessToken: data.accessToken,
      extraConfig: data.extraConfig ? JSON.stringify(data.extraConfig) : undefined,
      updatedAt: now,
    })
    .where(eq(channelConfigs.channel, channel))
    .run();

  return c.json({ success: true, message: `Konfigurasi ${channel} berhasil disimpan` });
});

const PORT = Number(process.env.PORT) || 3001;

console.log(`Starting OneMarket Server on port ${PORT}...`);
serve({
  fetch: app.fetch,
  port: PORT,
});
console.log(`🚀 OneMarket Backend API running at http://localhost:${PORT}`);
