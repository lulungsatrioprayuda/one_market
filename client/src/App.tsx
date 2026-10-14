import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { StatsBanner } from './components/StatsBanner.js';
import { ProductList } from './components/ProductList.js';
import { ProductFormSimple } from './components/ProductFormSimple.js';
import { ChannelSettings } from './components/ChannelSettings.js';
import type { Product, Category, ChannelConfig, DashboardStats } from './types.js';

export function App() {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'new-product' | 'channels'>('catalog');
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('om_simple_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleSimpleMode = () => {
    setIsSimpleMode((prev) => {
      const next = !prev;
      localStorage.setItem('om_simple_mode', String(next));
      return next;
    });
  };

  const loadData = useCallback(async () => {
    try {
      const [prodsRes, catsRes, chansRes, statsRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/categories').catch(() => null),
        fetch('/api/channels').catch(() => null),
        fetch('/api/stats').catch(() => null),
      ]);

      if (prodsRes && prodsRes.ok) {
        setProducts(await prodsRes.json());
      }
      if (catsRes && catsRes.ok) {
        setCategories(await catsRes.json());
      }
      if (chansRes && chansRes.ok) {
        setChannels(await chansRes.json());
      }
      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error('Failed to load OneMarket data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh stats & products every 4 seconds when queue is working or idle
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handlePublishProduct = async (id: string, channel?: string) => {
    try {
      const res = await fetch(`/api/products/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to trigger publish:', err);
    }
  };

  const handleSaveChannel = async (channel: string, data: Partial<ChannelConfig>) => {
    const res = await fetch(`/api/channels/${channel}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      loadData();
    }
  };

  const handleAddCategory = async (data: Partial<Category>) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      loadData();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isSimpleMode={isSimpleMode}
        onToggleSimpleMode={toggleSimpleMode}
        queuePending={stats?.queue.pending || 0}
      />

      <main style={{
        maxWidth: 1280,
        width: '100%',
        margin: '0 auto',
        padding: '28px 24px 60px',
        flex: 1,
      }}>
        {/* Banner notification for simple mode */}
        {isSimpleMode && currentTab === 'catalog' && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span>
              <span style={{ fontSize: '0.9rem', color: '#E5E7EB' }}>
                <strong>Mode Toko Keluarga Aktif:</strong> Anda cukup klik <em>+ Tambah Produk Baru</em>, masukkan foto dan harga, lalu sistem akan menyebarkannya ke Shopee, Tokopedia, dan OLX sekaligus.
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('new-product')}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              + Upload Produk Baru
            </button>
          </div>
        )}

        {/* Global Dashboard Metrics */}
        <StatsBanner stats={stats} />

        {/* Content View by Tab */}
        {currentTab === 'catalog' && (
          <ProductList
            products={products}
            isLoading={isLoading}
            onRefresh={loadData}
            onAddProduct={() => setCurrentTab('new-product')}
            onDeleteProduct={handleDeleteProduct}
            onPublishProduct={handlePublishProduct}
            isSimpleMode={isSimpleMode}
          />
        )}

        {currentTab === 'new-product' && (
          <ProductFormSimple
            categories={categories}
            isSimpleMode={isSimpleMode}
            onSuccess={() => {
              loadData();
              setCurrentTab('catalog');
            }}
            onCancel={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'channels' && (
          <ChannelSettings
            channels={channels}
            categories={categories}
            onSaveChannel={handleSaveChannel}
            onAddCategory={handleAddCategory}
          />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        OneMarket &copy; 2026 — Omnichannel Multi-Marketplace Automation Engine. Designed for Family Businesses & UMKM.
      </footer>
    </div>
  );
}

export default App;
