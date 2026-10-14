import { Package, ShoppingBag, Store, Globe, Clock, CheckCircle } from 'lucide-react';
import type { DashboardStats } from '../types.js';

interface StatsBannerProps {
  stats: DashboardStats | null;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 28,
    }}>
      {/* Total Master Products */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(59, 130, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60A5FA',
        }}>
          <Package size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total Produk Master
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>
            {stats.totalProducts}
          </div>
        </div>
      </div>

      {/* Shopee Channel Status */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderLeft: '4px solid var(--shopee-color)',
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--shopee-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--shopee-color)',
        }}>
          <ShoppingBag size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Live di Shopee
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--shopee-color)' }}>
            {stats.byChannel.shopee.published} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {stats.totalProducts}</span>
          </div>
        </div>
      </div>

      {/* Tokopedia Channel Status */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderLeft: '4px solid var(--tokopedia-color)',
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--tokopedia-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--tokopedia-color)',
        }}>
          <Store size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Live di Tokopedia
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--tokopedia-color)' }}>
            {stats.byChannel.tokopedia.published} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {stats.totalProducts}</span>
          </div>
        </div>
      </div>

      {/* OLX Channel Status */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderLeft: '4px solid var(--olx-color)',
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--olx-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--olx-color)',
        }}>
          <Globe size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Live di OLX
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--olx-color)' }}>
            {stats.byChannel.olx.published} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {stats.totalProducts}</span>
          </div>
        </div>
      </div>

      {/* Queue & Auto-sync */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: stats.totalQueued > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: stats.totalQueued > 0 ? '#FBBF24' : '#34D399',
        }}>
          {stats.totalQueued > 0 ? <Clock size={22} /> : <CheckCircle size={22} />}
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Status Antrean Upload
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stats.totalQueued > 0 ? '#FBBF24' : '#34D399' }}>
            {stats.totalQueued > 0 ? `${stats.totalQueued} Produk Diproses` : 'Semua Sinkron'}
          </div>
        </div>
      </div>
    </div>
  );
};
