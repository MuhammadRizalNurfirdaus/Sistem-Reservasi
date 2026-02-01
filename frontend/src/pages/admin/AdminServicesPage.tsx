import { useEffect, useState } from 'react';
import { servicesApi } from '../../services/api';
import type { Service, ServiceItem } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'services' | 'items'>('services');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    
    // Service Modal
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceForm, setServiceForm] = useState({
        name: '',
        description: '',
        icon: '',
        imageUrl: ''
    });

    // Item Modal
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        imageUrl: '',
        isAvailable: true
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await servicesApi.getAll();
            setServices(data);
            if (data.length > 0 && !selectedService) {
                setSelectedService(data[0]);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    // ============ SERVICE HANDLERS ============
    const handleEditService = (service: Service) => {
        setEditingService(service);
        setServiceForm({
            name: service.name,
            description: service.description || '',
            icon: service.icon || '',
            imageUrl: service.imageUrl || ''
        });
        setIsServiceModalOpen(true);
    };

    const handleDeleteService = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus layanan ini? Semua item di dalamnya juga akan dihapus.')) {
            try {
                await servicesApi.delete(id);
                setServices(prev => prev.filter(s => s.id !== id));
                if (selectedService?.id === id) {
                    setSelectedService(services.find(s => s.id !== id) || null);
                }
            } catch (error) {
                alert('Gagal menghapus layanan');
            }
        }
    };

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingService) {
                const updated = await servicesApi.update(editingService.id, serviceForm);
                setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...updated } : s));
            } else {
                const created = await servicesApi.create(serviceForm);
                setServices(prev => [...prev, created]);
            }
            setIsServiceModalOpen(false);
            resetServiceForm();
            fetchServices();
        } catch (error) {
            alert('Gagal menyimpan layanan');
        } finally {
            setSaving(false);
        }
    };

    const resetServiceForm = () => {
        setEditingService(null);
        setServiceForm({ name: '', description: '', icon: '', imageUrl: '' });
    };

    // ============ ITEM HANDLERS ============
    const handleEditItem = (item: ServiceItem) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            description: item.description || '',
            price: String(item.price),
            duration: item.duration ? String(item.duration) : '',
            imageUrl: item.imageUrl || '',
            isAvailable: item.isAvailable
        });
        setIsItemModalOpen(true);
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            try {
                await servicesApi.deleteItem(id);
                fetchServices();
            } catch (error) {
                alert('Gagal menghapus item');
            }
        }
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;
        
        setSaving(true);
        try {
            if (editingItem) {
                await servicesApi.updateItem(editingItem.id, itemForm);
            } else {
                await servicesApi.createItem(selectedService.id, itemForm);
            }
            setIsItemModalOpen(false);
            resetItemForm();
            fetchServices();
        } catch (error) {
            alert('Gagal menyimpan item');
        } finally {
            setSaving(false);
        }
    };

    const resetItemForm = () => {
        setEditingItem(null);
        setItemForm({ name: '', description: '', price: '', duration: '', imageUrl: '', isAvailable: true });
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    };

    if (loading) return <LoadingSpinner />;

    const currentItems = selectedService?.items || [];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Manajemen Layanan</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Kelola kategori layanan dan item dengan foto</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('services')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'services' ? 'var(--primary-600)' : 'white',
                        color: activeTab === 'services' ? 'white' : 'var(--gray-600)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    📂 Kategori Layanan
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'items' ? 'var(--primary-600)' : 'white',
                        color: activeTab === 'items' ? 'white' : 'var(--gray-600)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    📦 Item Layanan
                </button>
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => { resetServiceForm(); setIsServiceModalOpen(true); }}
                        >
                            + Tambah Kategori
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {services.map(service => (
                            <div key={service.id} style={{
                                background: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid var(--gray-100)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}>
                                {/* Service Image */}
                                <div style={{ position: 'relative', height: '160px', background: 'var(--gray-100)' }}>
                                    {service.imageUrl ? (
                                        <img
                                            src={service.imageUrl}
                                            alt={service.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '64px' }}>
                                            {service.icon || '📦'}
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: 600
                                    }}>
                                        {service.items?.length || 0} Item
                                    </div>
                                </div>

                                {/* Service Info */}
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '28px' }}>{service.icon || '📦'}</span>
                                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{service.name}</h3>
                                    </div>
                                    <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
                                        {service.description || 'Tidak ada deskripsi'}
                                    </p>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{ flex: 1, background: 'var(--primary-50)', color: 'var(--primary-600)', border: 'none' }}
                                            onClick={() => handleEditService(service)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none' }}
                                            onClick={() => { setSelectedService(service); setActiveTab('items'); }}
                                        >
                                            📦 Kelola Item
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
                                            onClick={() => handleDeleteService(service.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
                <div>
                    {/* Service Selector */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        marginBottom: '24px',
                        background: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid var(--gray-100)'
                    }}>
                        <label style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Pilih Kategori:</label>
                        <select
                            value={selectedService?.id || ''}
                            onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value) || null)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--gray-200)',
                                fontSize: '15px',
                                fontWeight: 600,
                                minWidth: '200px'
                            }}
                        >
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                            ))}
                        </select>
                        <div style={{ flex: 1 }} />
                        <button
                            className="btn btn-primary"
                            onClick={() => { resetItemForm(); setIsItemModalOpen(true); }}
                            disabled={!selectedService}
                        >
                            + Tambah Item
                        </button>
                    </div>

                    {selectedService && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '16px',
                                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                                padding: '20px 24px',
                                borderRadius: '16px',
                                color: 'white'
                            }}>
                                <span style={{ fontSize: '48px' }}>{selectedService.icon || '📦'}</span>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{selectedService.name}</h2>
                                    <p style={{ opacity: 0.9, margin: '4px 0 0' }}>{selectedService.description}</p>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800 }}>{currentItems.length}</div>
                                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Item</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items Grid */}
                    {currentItems.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            background: 'white',
                            borderRadius: '16px',
                            border: '2px dashed var(--gray-200)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                            <h3 style={{ color: 'var(--gray-500)', marginBottom: '8px' }}>Belum ada item</h3>
                            <p style={{ color: 'var(--gray-400)', marginBottom: '24px' }}>
                                Tambahkan item layanan pertama untuk kategori ini
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => { resetItemForm(); setIsItemModalOpen(true); }}
                            >
                                + Tambah Item Pertama
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {currentItems.map(item => (
                                <div key={item.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--gray-100)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}>
                                    {/* Item Image */}
                                    <div style={{ position: 'relative', height: '140px', background: 'var(--gray-100)' }}>
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '48px', color: 'var(--gray-300)' }}>
                                                🖼️
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: item.isAvailable ? '#16a34a' : '#dc2626',
                                            color: 'white',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 600
                                        }}>
                                            {item.isAvailable ? '✓ Aktif' : '✗ Nonaktif'}
                                        </div>
                                    </div>

                                    {/* Item Info */}
                                    <div style={{ padding: '16px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{item.name}</h4>
                                        <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.4 }}>
                                            {item.description || 'Tidak ada deskripsi'}
                                        </p>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-600)' }}>
                                                {formatPrice(item.price)}
                                            </span>
                                            {item.duration && (
                                                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                                                    ⏱️ {item.duration} menit
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-sm"
                                                style={{ flex: 1, background: 'var(--primary-50)', color: 'var(--primary-600)', border: 'none' }}
                                                onClick={() => handleEditItem(item)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Service Modal */}
            {isServiceModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '20px', 
                        width: '560px', 
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ 
                            padding: '24px', 
                            borderBottom: '1px solid var(--gray-100)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                {editingService ? '✏️ Edit Kategori' : '➕ Tambah Kategori Baru'}
                            </h2>
                            <button
                                onClick={() => setIsServiceModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--gray-400)' }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleServiceSubmit} style={{ padding: '24px' }}>
                            {/* Image Preview */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--gray-700)' }}>
                                    Gambar Kategori
                                </label>
                                <div style={{ 
                                    width: '100%', 
                                    height: '160px', 
                                    borderRadius: '12px', 
                                    background: 'var(--gray-100)',
                                    border: '2px dashed var(--gray-300)',
                                    overflow: 'hidden'
                                }}>
                                    {serviceForm.imageUrl ? (
                                        <img
                                            src={serviceForm.imageUrl}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
                                            <span style={{ fontSize: '48px', marginBottom: '8px' }}>🖼️</span>
                                            <span>Masukkan URL gambar</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label className="form-label">Nama Kategori *</label>
                                    <input
                                        className="form-input"
                                        value={serviceForm.name}
                                        onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                                        placeholder="Contoh: Salon"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Icon</label>
                                    <input
                                        className="form-input"
                                        value={serviceForm.icon}
                                        onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                                        placeholder="💇"
                                        style={{ textAlign: 'center', fontSize: '24px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Deskripsi</label>
                                <textarea
                                    className="form-input"
                                    value={serviceForm.description}
                                    onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="Deskripsi singkat tentang kategori layanan"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL Gambar</label>
                                <input
                                    className="form-input"
                                    value={serviceForm.imageUrl}
                                    onChange={e => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsServiceModalOpen(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {isItemModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '20px', 
                        width: '560px', 
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ 
                            padding: '24px', 
                            borderBottom: '1px solid var(--gray-100)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                    {editingItem ? '✏️ Edit Item' : '➕ Tambah Item Baru'}
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0' }}>
                                    {selectedService?.icon} {selectedService?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsItemModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--gray-400)' }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleItemSubmit} style={{ padding: '24px' }}>
                            {/* Image Preview */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--gray-700)' }}>
                                    Gambar Item
                                </label>
                                <div style={{ 
                                    width: '100%', 
                                    height: '140px', 
                                    borderRadius: '12px', 
                                    background: 'var(--gray-100)',
                                    border: '2px dashed var(--gray-300)',
                                    overflow: 'hidden'
                                }}>
                                    {itemForm.imageUrl ? (
                                        <img
                                            src={itemForm.imageUrl}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
                                            <span style={{ fontSize: '40px', marginBottom: '8px' }}>🖼️</span>
                                            <span>Masukkan URL gambar</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nama Item *</label>
                                <input
                                    className="form-input"
                                    value={itemForm.name}
                                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                    placeholder="Contoh: Potong Rambut Pria"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Deskripsi</label>
                                <textarea
                                    className="form-input"
                                    value={itemForm.description}
                                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="Deskripsi singkat tentang item layanan"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Harga (Rp) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={itemForm.price}
                                        onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                                        placeholder="50000"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Durasi (menit)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={itemForm.duration}
                                        onChange={e => setItemForm({ ...itemForm, duration: e.target.value })}
                                        placeholder="30"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL Gambar</label>
                                <input
                                    className="form-input"
                                    value={itemForm.imageUrl}
                                    onChange={e => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={itemForm.isAvailable}
                                        onChange={e => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary-600)' }}
                                    />
                                    <span style={{ fontWeight: 600 }}>Item tersedia untuk dipesan</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsItemModalOpen(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
