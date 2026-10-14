import { useState } from 'react';
import { Search, ExternalLink, RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock, ImageOff, Plus } from 'lucide-react';
import type { Product } from '../types.js';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onPublishProduct: (id: string, channel?: string) => void;
  isSimpleMode: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  onRefresh,
  onAddProduct,
  onDeleteProduct,
  onPublishProduct,
  isSimpleMode: _isSimpleMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'shopee' | 'tokopedia' | 'olx'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterChannel === 'all') return true;

    const pub = p.publications?.find((x) => x.channel === filterChannel);
    return pub && pub.status === 'published';
  });

  const handlePublish = async (productId: string, channel?: string) => {
    setActionLoadingId(productId);
    try {
      await onPublishProduct(productId, channel);
    } finally {
      setTimeout(() => setActionLoadingId(null), 500);
    }
  };

  const getChannelBadge = (product: Product, channelName: 'shopee' | 'tokopedia' | 'olx') => {
    const pub = product.publications?.find((p) => p.channel === channelName);

    if (!pub) {
      return (
        <span 
          onClick={() => handlePublish(product.id, channelName)}
          title="Klik untuk menerbitkan ke kanal ini"
          style={{
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          + Pasang
        </span>
      );
    }

    if (pub.status === 'published') {
      return (
        <a
          href={pub.externalUrl || '#'}
          target="_blank"
          rel="noreferrer"
          title={`Buka di ${channelName.toUpperCase()}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            textDecoration: 'none',
          }}
        >
          <CheckCircle2 size={13} />
          <span>Live</span>
          <ExternalLink size={11} />
        </a>
      );
    }

    if (pub.status === 'queued' || pub.status === 'publishing') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: 6,
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#FBBF24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}>
          <Clock size={13} />
          <span>Antrean</span>
        </span>
      );
    }

    if (pub.status === 'failed') {
      return (
        <button
          onClick={() => handlePublish(product.id, channelName)}
          title={`Gagal: ${pub.errorMessage || 'Unknown error'}. Klik untuk coba lagi.`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#F87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
          }}
        >
          <AlertCircle size={13} />
          <span>Coba Lagi</span>
        </button>
      );
    }

    return (
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Draft
      </span>
    );
  };

  return (
    <div className="fade-in">
      {/* Header bar: Search, Filter, Add Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Cari berdasarkan nama produk atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 42, width: '100%', marginBottom: 0 }}
          />
        </div>

        {/* Filter Channels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterChannel('all')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterChannel === 'all' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
              color: filterChannel === 'all' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterChannel('shopee')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterChannel === 'shopee' ? 'var(--shopee-color)' : 'var(--bg-surface-elevated)',
              color: filterChannel === 'shopee' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Shopee Live
          </button>
          <button
            onClick={() => setFilterChannel('tokopedia')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterChannel === 'tokopedia' ? 'var(--tokopedia-color)' : 'var(--bg-surface-elevated)',
              color: filterChannel === 'tokopedia' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Tokopedia Live
          </button>
          <button
            onClick={() => setFilterChannel('olx')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterChannel === 'olx' ? 'var(--olx-color)' : 'var(--bg-surface-elevated)',
              color: filterChannel === 'olx' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            OLX Live
          </button>

          <button
            onClick={onRefresh}
            className="btn-secondary"
            title="Refresh katalog"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={onAddProduct}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Product List / Cards */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p>Memuat katalog produk...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--text-muted)',
          }}>
            <ImageOff size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Belum Ada Produk</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 20px' }}>
            {searchTerm 
              ? 'Tidak ada produk yang cocok dengan kata kunci pencarian Anda.' 
              : 'Mulai input produk pertama Anda dan rasakan kemudahan publikasi otomatis ke Shopee, Tokopedia, dan OLX sekaligus.'}
          </p>
          <button onClick={onAddProduct} className="btn-primary">
            <Plus size={18} />
            <span>+ Buat Produk Sekarang</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((product) => {
            const primaryImg = product.images?.[0]?.url;

            return (
              <div
                key={product.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                {/* Left: Thumbnail & Main Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 280, flex: '1 1 320px' }}>
                  <div style={{
                    width: 68,
                    height: 68,
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {primaryImg ? (
                      <img src={primaryImg} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageOff size={24} color="var(--text-muted)" />
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: 4 }}>
                      {product.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        SKU: {product.sku}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Stok: <strong style={{ color: '#FFF' }}>{product.masterStock}</strong>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Berat: {product.weight}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Price */}
                <div style={{ minWidth: 140 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Harga Master
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
                    Rp {product.masterPrice.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Multi-Channel Publication Status Badges */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                }}>
                  {/* Shopee */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--shopee-color)' }}>
                      SHOPEE
                    </span>
                    {getChannelBadge(product, 'shopee')}
                  </div>

                  <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />

                  {/* Tokopedia */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--tokopedia-color)' }}>
                      TOKOPEDIA
                    </span>
                    {getChannelBadge(product, 'tokopedia')}
                  </div>

                  <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />

                  {/* OLX */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--olx-color)' }}>
                      OLX
                    </span>
                    {getChannelBadge(product, 'olx')}
                  </div>
                </div>

                {/* Right Actions: Sync & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handlePublish(product.id)}
                    className="btn-secondary"
                    title="Sinkronkan ulang ke semua kanal yang dipilih"
                    disabled={actionLoadingId === product.id}
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <RefreshCw size={14} style={{ animation: actionLoadingId === product.id ? 'spin 1s linear infinite' : 'none' }} />
                    <span>Sinkron</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus produk "${product.name}"?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: 'var(--text-muted)',
                      borderRadius: 8,
                      padding: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Hapus produk"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
