import { useState } from 'react';
import { Shield, Key, Save, Plus, Tag, CheckCircle2, Globe } from 'lucide-react';
import type { ChannelConfig, Category } from '../types.js';

interface ChannelSettingsProps {
  channels: ChannelConfig[];
  categories: Category[];
  onSaveChannel: (channel: string, data: Partial<ChannelConfig>) => Promise<void>;
  onAddCategory: (data: Partial<Category>) => Promise<void>;
}

export const ChannelSettings: React.FC<ChannelSettingsProps> = ({
  channels,
  categories,
  onSaveChannel,
  onAddCategory,
}) => {
  const [activeChannelTab, setActiveChannelTab] = useState<'shopee' | 'tokopedia' | 'olx'>('shopee');
  const [savingChannel, setSavingChannel] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Current channel form state
  const currentConfig = channels.find((c) => c.channel === activeChannelTab);
  const [shopId, setShopId] = useState(currentConfig?.shopId || '');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [apiSecret, setApiSecret] = useState(currentConfig?.apiSecret || '');
  const [accessToken, setAccessToken] = useState(currentConfig?.accessToken || '');
  const [shopSlug, setShopSlug] = useState(() => {
    try {
      return (currentConfig as any)?.extraConfig ? JSON.parse((currentConfig as any).extraConfig)?.shopSlug || '' : '';
    } catch {
      return '';
    }
  });
  const [isSandbox, setIsSandbox] = useState(currentConfig?.isSandbox ?? false);
  const [isEnabled, setIsEnabled] = useState(currentConfig?.isEnabled ?? true);

  // Switch channel tab handler
  const handleSelectTab = (tab: 'shopee' | 'tokopedia' | 'olx') => {
    setActiveChannelTab(tab);
    const cfg = channels.find((c) => c.channel === tab);
    setShopId(cfg?.shopId || '');
    setApiKey(cfg?.apiKey || '');
    setApiSecret(cfg?.apiSecret || '');
    setAccessToken(cfg?.accessToken || '');
    try {
      setShopSlug((cfg as any)?.extraConfig ? JSON.parse((cfg as any).extraConfig)?.shopSlug || '' : '');
    } catch {
      setShopSlug('');
    }
    setIsSandbox(cfg?.isSandbox ?? false);
    setIsEnabled(cfg?.isEnabled ?? true);
    setSavedSuccess(false);
  };

  const handleSaveCurrentChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingChannel(true);
    setSavedSuccess(false);

    try {
      await onSaveChannel(activeChannelTab, {
        shopId,
        apiKey,
        apiSecret,
        accessToken,
        isSandbox,
        isEnabled,
        extraConfig: { shopSlug } as any,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSavingChannel(false);
    }
  };

  // Category mapping form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatShopee, setNewCatShopee] = useState('');
  const [newCatTokopedia, setNewCatTokopedia] = useState('');
  const [newCatOlx, setNewCatOlx] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setAddingCat(true);
    try {
      await onAddCategory({
        name: newCatName.trim(),
        shopeeCategoryName: newCatShopee.trim(),
        tokopediaCategoryName: newCatTokopedia.trim(),
        olxCategoryName: newCatOlx.trim(),
      });
      setNewCatName('');
      setNewCatShopee('');
      setNewCatTokopedia('');
      setNewCatOlx('');
    } finally {
      setAddingCat(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Channel Credentials Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Shield size={24} color="#3B82F6" />
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Konfigurasi API & Kredensial Marketplace</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Pengaturan kredensial toko resmi Shopee Open Platform, Tokopedia/TikTok Shop Partner, dan OLX Automator.
            </p>
          </div>
        </div>

        {/* Channel Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <button
            onClick={() => handleSelectTab('shopee')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeChannelTab === 'shopee' ? 'var(--shopee-color)' : 'var(--bg-surface-elevated)',
              color: '#FFF',
            }}
          >
            Shopee Indonesia
          </button>
          <button
            onClick={() => handleSelectTab('tokopedia')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeChannelTab === 'tokopedia' ? 'var(--tokopedia-color)' : 'var(--bg-surface-elevated)',
              color: '#FFF',
            }}
          >
            Tokopedia / TikTok Shop
          </button>
          <button
            onClick={() => handleSelectTab('olx')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeChannelTab === 'olx' ? 'var(--olx-color)' : 'var(--bg-surface-elevated)',
              color: '#FFF',
            }}
          >
            OLX Automator (Playwright)
          </button>
        </div>

        {/* Channel Config Form */}
        <form onSubmit={handleSaveCurrentChannel}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Key size={14} /> {activeChannelTab === 'shopee' ? 'Shop ID Shopee' : activeChannelTab === 'tokopedia' ? 'Shop ID Tokopedia' : 'Nomor Akun / ID OLX'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={activeChannelTab === 'shopee' ? 'Contoh: 12938472 (dari Seller Center)' : activeChannelTab === 'tokopedia' ? 'Contoh: 1827492' : 'ID Akun OLX'}
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeChannelTab === 'shopee' ? 'ID numerik toko Anda di Shopee Seller Center' : 'ID Toko numerik terdaftar di Tokopedia Developer'}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Key size={14} /> {activeChannelTab === 'shopee' ? 'Partner ID (Open Platform)' : activeChannelTab === 'tokopedia' ? 'FS ID / Client ID' : 'Email / User ID'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={activeChannelTab === 'shopee' ? 'Partner ID Shopee Open Platform' : 'Fulfillment Service ID Tokopedia'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeChannelTab === 'shopee' ? 'Ditemukan di console.open.shopee.com' : 'ID integrasi partner dari developer.tokopedia.com'}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Key size={14} /> {activeChannelTab === 'shopee' ? 'Partner Key (Secret)' : 'Client Secret'}
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••••••"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Kunci rahasia API untuk tanda tangan request HMAC / OAuth
              </span>
            </div>

            {activeChannelTab === 'shopee' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <Key size={14} /> Access Token (Otorisasi Toko)
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Token otorisasi toko Shopee..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Diperoleh dari otorisasi toko Shopee (OAuth Shop Authorization)
                </span>
              </div>
            )}

            {activeChannelTab === 'tokopedia' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <Globe size={14} /> Domain / Slug Toko Tokopedia
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: toko-batik-solo"
                  value={shopSlug}
                  onChange={(e) => setShopSlug(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Digunakan untuk membuat tautan langsung: tokopedia.com/[nama-toko]/[produk]
                </span>
              </div>
            )}

            {/* Sandbox vs Live Switcher */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status Mode Publikasi</label>
              <div style={{
                marginTop: 6,
                padding: '8px 12px',
                borderRadius: 8,
                background: isSandbox ? 'rgba(234, 179, 8, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: isSandbox ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={!isSandbox}
                    onChange={(e) => setIsSandbox(!e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#10B981' }}
                  />
                  <div>
                    <strong style={{ color: isSandbox ? '#FACC15' : '#34D399' }}>
                      {isSandbox ? 'Mode Sandbox / Simulasi' : 'Mode LIVE Langsung ke Toko Riil'}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isSandbox ? 'Centang untuk aktifkan mode LIVE ke marketplace asli' : 'Produk yang diterbitkan akan langsung masuk ke etalase akun marketplace Anda'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#10B981' }}
              />
              <span>Aktifkan integrasi publikasi ke <strong>{activeChannelTab.toUpperCase()}</strong></span>
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={savingChannel}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              {savingChannel ? (
                <span>Menyimpan...</span>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Konfigurasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category Mapper Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Tag size={24} color="#8B5CF6" />
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Category & Attribute Mapper</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Petakan kategori internal toko ke kategori resmi masing-masing marketplace agar produk lolos validasi otomatis.
            </p>
          </div>
        </div>

        {/* Existing Mappings Table */}
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>Kategori Toko</th>
                <th style={{ padding: '12px 16px', color: 'var(--shopee-color)' }}>Kategori Shopee</th>
                <th style={{ padding: '12px 16px', color: 'var(--tokopedia-color)' }}>Kategori Tokopedia</th>
                <th style={{ padding: '12px 16px', color: 'var(--olx-color)' }}>Kategori OLX</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {c.shopeeCategoryName || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {c.tokopediaCategoryName || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {c.olxCategoryName || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Category Mapping */}
        <form onSubmit={handleCreateCategory} style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
          gap: 12,
          alignItems: 'end',
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Kategori Baru</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Sepatu Olahraga"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--shopee-color)' }}>Kategori Shopee</label>
            <input
              type="text"
              className="form-input"
              placeholder="Sepatu Pria > Sneakers"
              value={newCatShopee}
              onChange={(e) => setNewCatShopee(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--tokopedia-color)' }}>Kategori Tokopedia</label>
            <input
              type="text"
              className="form-input"
              placeholder="Fashion Pria > Sepatu Sneakers"
              value={newCatTokopedia}
              onChange={(e) => setNewCatTokopedia(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--olx-color)' }}>Kategori OLX</label>
            <input
              type="text"
              className="form-input"
              placeholder="Fashion & Aksesoris > Sepatu"
              value={newCatOlx}
              onChange={(e) => setNewCatOlx(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={addingCat}
            style={{ padding: '12px 18px', height: 46 }}
          >
            <Plus size={16} />
            <span>Tambah</span>
          </button>
        </form>
      </div>
    </div>
  );
};
