import { Store, Layers, Sliders, RefreshCw, Zap } from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'new-product' | 'channels';
  onSelectTab: (tab: 'catalog' | 'new-product' | 'channels') => void;
  isSimpleMode: boolean;
  onToggleSimpleMode: () => void;
  queuePending: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isSimpleMode,
  onToggleSimpleMode,
  queuePending,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('catalog')} 
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)',
          }}>
            <Store size={24} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                OneMarket
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60A5FA',
                border: '1px solid rgba(59, 130, 246, 0.4)',
              }}>
                OMNICHANNEL
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Shopee • Tokopedia • OLX Auto-Publisher
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onSelectTab('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: currentTab === 'catalog' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: currentTab === 'catalog' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={18} />
            Daftar Produk
          </button>

          <button
            onClick={() => onSelectTab('new-product')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: currentTab === 'new-product' ? 'var(--accent-primary)' : 'rgba(59, 130, 246, 0.12)',
              color: currentTab === 'new-product' ? '#FFF' : '#93C5FD',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={18} />
            + Tambah Produk Baru
          </button>

          {!isSimpleMode && (
            <button
              onClick={() => onSelectTab('channels')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: currentTab === 'channels' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: currentTab === 'channels' ? '#FFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sliders size={18} />
              Integrasi & Kategori
            </button>
          )}
        </nav>

        {/* Right Action: Persona Mode Switcher & Queue Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {queuePending > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: 20,
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#FBBF24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
              <span>{queuePending} Mengunggah...</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-elevated)',
            padding: 4,
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={onToggleSimpleMode}
              title="Ganti ke tampilan ramah orang tua / mode teknis"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 7,
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: isSimpleMode ? '#10B981' : 'transparent',
                color: isSimpleMode ? '#FFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              🌱 Mode Sederhana {isSimpleMode && '(Aktif)'}
            </button>
            <button
              onClick={onToggleSimpleMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 7,
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: !isSimpleMode ? 'var(--accent-primary)' : 'transparent',
                color: !isSimpleMode ? '#FFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              ⚙️ Mode Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
