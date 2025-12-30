import { useEffect, useState } from 'react';
import { servicesApi } from '../../services/api';
import type { Service } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await servicesApi.getAll();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            icon: service.icon || '',
            imageUrl: service.imageUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
            try {
                await servicesApi.delete(id);
                setServices(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                alert('Gagal menghapus layanan');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                const updated = await servicesApi.update(editingService.id, formData);
                setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
            } else {
                const created = await servicesApi.create(formData);
                setServices(prev => [...prev, created]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            alert('Gagal menyimpan layanan');
        }
    };

    const resetForm = () => {
        setEditingService(null);
        setFormData({ name: '', description: '', icon: '', imageUrl: '' });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Manajemen Layanan</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Kelola layanan salon, prasmanan, dan riasan</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                >
                    + Tambah Layanan
                </button>
            </div>

            <div className="card" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={thStyle}>Layanan</th>
                            <th style={thStyle}>Deskripsi</th>
                            <th style={thStyle}>Jumlah Item</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                            {service.icon || '✨'}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{service.name}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>{service.description}</td>
                                <td style={tdStyle}>{service.items?.length || 0} Item</td>
                                <td style={tdStyle}>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--success-50)', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                                        Aktif
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            style={{ color: 'var(--primary-600)', borderColor: 'var(--primary-200)' }}
                                            onClick={() => handleEdit(service)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                                            onClick={() => handleDelete(service.id)}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
                            {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nama Layanan</label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deskripsi</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Icon (Emoji)</label>
                                <input
                                    className="form-input"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="Contoh: 💇"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input
                                    className="form-input"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle = {
    padding: '16px 24px',
    textAlign: 'left' as const,
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--gray-500)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

const tdStyle = {
    padding: '16px 24px',
    fontSize: '14px',
    color: 'var(--gray-700)',
};
