import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { servicesApi } from '../services/api';
import type { Service, ServiceItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ServiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        servicesApi.getById(id)
            .then(setService)
            .catch(() => setError('Layanan tidak ditemukan.'))
            .finally(() => setLoading(false));
    }, [id]);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numPrice);
    };

    const handleReserve = (item: ServiceItem) => {
        if (!user) { login(); return; }
        navigate(`/reserve/${item.id}`);
    };

    if (loading) return <div className="page-wrapper"><LoadingSpinner text="Memuat detail layanan..." /></div>;

    if (error || !service) {
        return (
            <div className="page-wrapper">
                <div className="container section">
                    <div className="empty-state">
                        <div className="empty-icon">😕</div>
                        <h2 className="empty-title">{error || 'Layanan tidak ditemukan'}</h2>
                        <Link to="/services" className="btn btn-primary">← Kembali ke Layanan</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Header with gradient */}
            <div className="dashboard-header" style={{ marginBottom: '40px' }}>
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb" style={{ marginBottom: '20px' }}>
                        <Link to="/">Beranda</Link>
                        <span className="breadcrumb-separator">›</span>
                        <Link to="/services">Layanan</Link>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current" style={{ color: 'white' }}>{service.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            fontSize: '64px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '20px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {service.icon || '🎯'}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', color: 'white' }}>
                                {service.name}
                            </h1>
                            <p style={{ fontSize: '16px', opacity: 0.85, color: 'white' }}>
                                {service.description}
                            </p>
                            <p style={{ fontSize: '14px', opacity: 0.7, color: 'white', marginTop: '8px' }}>
                                {service.items.length} paket tersedia
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <section className="container" style={{ paddingBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--gray-900)' }}>
                    ✨ Pilihan Paket
                </h2>

                {service.items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3 className="empty-title">Belum ada paket tersedia</h3>
                        <p className="empty-description">Paket untuk layanan ini sedang dalam persiapan.</p>
                    </div>
                ) : (
                    <div className="service-items-grid">
                        {service.items.map((item, index) => (
                            <div key={item.id} className="item-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="item-image">
                                    <img
                                        src={item.imageUrl || service.imageUrl || '/images/salon.png'}
                                        alt={item.name}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="item-body">
                                    <h3 className="item-name">{item.name}</h3>
                                    <p className="item-description">{item.description}</p>
                                    <div className="item-details">
                                        <span className="item-price">{formatPrice(item.price)}</span>
                                        {item.duration && (
                                            <span className="item-duration">⏱️ {item.duration} menit</span>
                                        )}
                                    </div>
                                    {!item.isAvailable && (
                                        <div className="alert alert-warning" style={{ margin: '8px 0', padding: '8px 12px', fontSize: '12px' }}>
                                            ⚠️ Tidak tersedia saat ini
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => handleReserve(item)}
                                        disabled={!item.isAvailable}
                                    >
                                        {user ? '📅 Reservasi Sekarang' : '🔐 Login untuk Reservasi'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
