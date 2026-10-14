import { useState, useRef } from 'react';
import { UploadCloud, X, Check, ArrowRight, ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { Category } from '../types.js';

interface UploadedImage {
  url: string;
  filename: string;
}

interface ProductFormSimpleProps {
  categories: Category[];
  isSimpleMode: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductFormSimple: React.FC<ProductFormSimpleProps> = ({
  categories,
  isSimpleMode,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Channels selected for publishing
  const [selectedChannels, setSelectedChannels] = useState<{ [key: string]: boolean }>({
    shopee: true,
    tokopedia: true,
    olx: true,
  });

  // Advanced fields (shown in advanced mode or toggled in simple mode)
  const [showAdvanced, setShowAdvanced] = useState(!isSimpleMode);
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('200'); // grams
  const [length, setLength] = useState('15');
  const [width, setWidth] = useState('15');
  const [height, setHeight] = useState('5');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploaded: UploadedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengunggah gambar');
        }

        uploaded.push({
          url: data.url,
          filename: data.filename,
        });
      }

      setImages((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat mengunggah foto');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Nama produk wajib diisi.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setSubmitError('Harga produk harus diisi dengan benar.');
      return;
    }

    if (images.length === 0) {
      setSubmitError('Mohon sertakan minimal 1 foto produk untuk dipasang ke marketplace.');
      return;
    }

    const activeChannels = Object.keys(selectedChannels).filter((ch) => selectedChannels[ch]);
    if (activeChannels.length === 0) {
      setSubmitError('Pilih minimal 1 marketplace tujuan publikasi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim(),
        masterPrice: Number(price),
        masterStock: Number(stock) || 0,
        weight: Number(weight) || 200,
        length: Number(length) || 10,
        width: Number(width) || 10,
        height: Number(height) || 10,
        categoryId: categoryId || undefined,
        images,
        channels: activeChannels,
        autoPublish: true,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menyimpan produk');
      }

      onSuccess();
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '28px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
          {isSimpleMode ? '🌱 Tambah Produk Baru (Sekali Isi, Tayang di Semua)' : 'Tambah Master Produk'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isSimpleMode 
            ? 'Cukup isi data pokok di bawah ini. Sistem OneMarket akan memformat dan membagikannya ke toko Shopee, Tokopedia, dan OLX secara otomatis.'
            : 'Form master katalog produk terpusat dengan mapping atribut & multi-channel distribution queue.'
          }
        </p>
      </div>

      {submitError && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#F87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: 20,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Info size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Upload Images */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label form-label-required">
            Foto Produk (Bisa pilih beberapa foto sekaligus)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.2s ease',
            }}
          >
            <UploadCloud size={40} color="#3B82F6" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#FFF' }}>
              Klik di sini atau tarik foto produk ke area ini
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Format didukung: JPG, PNG, WEBP (Otomatis dioptimasi untuk marketplace)
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          {isUploading && (
            <p style={{ fontSize: '0.85rem', color: '#FBBF24', marginTop: 8 }}>
              ⏳ Sedang mengunggah dan mengompres foto...
            </p>
          )}

          {uploadError && (
            <p style={{ fontSize: '0.85rem', color: '#F87171', marginTop: 8 }}>
              ⚠️ {uploadError}
            </p>
          )}

          {/* Image Previews */}
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: idx === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <img
                    src={img.url}
                    alt={`Preview ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {idx === 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(59, 130, 246, 0.9)',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '2px 0',
                    }}>
                      FOTO UTAMA
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Nama Produk */}
        <div className="form-group">
          <label className="form-label form-label-required">
            Nama Produk Lengkap
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Kemeja Batik Pria Lengan Panjang Katun Halus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: '1.05rem', fontWeight: 500 }}
            required
          />
        </div>

        {/* Step 3: Harga & Stok */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label form-label-required">
              Harga Jual (Rp)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}>
                Rp
              </span>
              <input
                type="number"
                className="form-input"
                placeholder="150000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ paddingLeft: 42, fontSize: '1.05rem', fontWeight: 700, color: '#34D399' }}
                required
              />
            </div>
            {price && Number(price) > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Terbaca: Rp {Number(price).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Stok Tersedia
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="10"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{ fontSize: '1.05rem', fontWeight: 600 }}
            />
          </div>
        </div>

        {/* Step 4: Deskripsi Produk */}
        <div className="form-group">
          <label className="form-label">
            Keterangan / Deskripsi Produk
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Tuliskan detail bahan, ukuran, keunggulan produk..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Step 5: Target Marketplaces Checkbox Selection */}
        <div className="form-group" style={{ marginTop: 20 }}>
          <label className="form-label">
            Terbitkan ke Marketplace Tujuan (Pilih satu atau sekaligus):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {/* Shopee */}
            <div
              onClick={() => toggleChannel('shopee')}
              style={{
                border: selectedChannels.shopee ? '2px solid var(--shopee-color)' : '1px solid var(--border-subtle)',
                background: selectedChannels.shopee ? 'var(--shopee-bg)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'var(--shopee-color)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}>
                  S
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedChannels.shopee ? '#FFF' : 'var(--text-secondary)' }}>
                    Shopee
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    API Terintegrasi
                  </div>
                </div>
              </div>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: selectedChannels.shopee ? 'var(--shopee-color)' : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {selectedChannels.shopee && <Check size={14} color="#FFF" />}
              </div>
            </div>

            {/* Tokopedia */}
            <div
              onClick={() => toggleChannel('tokopedia')}
              style={{
                border: selectedChannels.tokopedia ? '2px solid var(--tokopedia-color)' : '1px solid var(--border-subtle)',
                background: selectedChannels.tokopedia ? 'var(--tokopedia-bg)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'var(--tokopedia-color)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}>
                  T
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedChannels.tokopedia ? '#FFF' : 'var(--text-secondary)' }}>
                    Tokopedia
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Partner API
                  </div>
                </div>
              </div>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: selectedChannels.tokopedia ? 'var(--tokopedia-color)' : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {selectedChannels.tokopedia && <Check size={14} color="#FFF" />}
              </div>
            </div>

            {/* OLX */}
            <div
              onClick={() => toggleChannel('olx')}
              style={{
                border: selectedChannels.olx ? '2px solid var(--olx-color)' : '1px solid var(--border-subtle)',
                background: selectedChannels.olx ? 'var(--olx-bg)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'var(--olx-color)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}>
                  O
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedChannels.olx ? '#FFF' : 'var(--text-secondary)' }}>
                    OLX Indonesia
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Iklan Baris Otomatis
                  </div>
                </div>
              </div>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: selectedChannels.olx ? 'var(--olx-color)' : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {selectedChannels.olx && <Check size={14} color="#FFF" />}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Settings (SKU, Berat, Dimensi, Kategori) */}
        <div style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: showAdvanced ? 16 : 0,
            }}
          >
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showAdvanced ? 'Sembunyikan Pengaturan Teknis (SKU, Berat, Dimensi)' : 'Tampilkan Pengaturan Teknis (SKU, Berat, Dimensi) — Opsional'}
          </button>

          {showAdvanced && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">SKU / Kode Toko</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auto-generate jika kosong"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Berat Paket (gram)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kategori Internal</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dimensi P x L x T (cm)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="P"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    style={{ textAlign: 'center', padding: '10px 4px' }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="L"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    style={{ textAlign: 'center', padding: '10px 4px' }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="T"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    style={{ textAlign: 'center', padding: '10px 4px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div style={{
          marginTop: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 20,
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isUploading}
            style={{
              padding: '14px 32px',
              fontSize: '1.05rem',
              fontWeight: 700,
            }}
          >
            {isSubmitting ? (
              <span>⏳ Sedang Memproses & Menerbitkan...</span>
            ) : (
              <>
                <ShieldCheck size={20} />
                <span>🚀 Simpan & Terbitkan Sekarang</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
