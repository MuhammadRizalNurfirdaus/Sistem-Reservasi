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
        const fetchService = async () => {
            if (!id) return;
            try {
                const data = await servicesApi.getById(id);
                setService(data);
            } catch (err) {
                setError('Layanan tidak ditemukan.');
                console.error('Error fetching service:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    };

    const handleReserve = (item: ServiceItem) => {
        if (!user) {
            login();
            return;
        }
        navigate(`/reserve/${item.id}`);
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <LoadingSpinner text="Memuat detail layanan..." />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="page-wrapper">
                <div className="container section">
                    <div className="empty-state">
                        <div className="empty-icon">😕</div>
                        <h2 className="empty-title">{error || 'Layanan tidak ditemukan'}</h2>
                        <Link to="/services" className="btn btn-primary">
                            ← Kembali ke Layanan
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div style={{
                background: 'var(--gradient-primary)',
                padding: '60px 0',
                color: 'white',
                marginBottom: '40px'
            }}>
                <div className="container">
                    <Link to="/services" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        ← Kembali ke Layanan
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            fontSize: '64px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '20px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {service.icon || '🎯'}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>
                                {service.name}
                            </h1>
                            <p style={{ fontSize: '18px', opacity: 0.9 }}>
                                {service.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <section className="container" style={{ paddingBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--gray-800)' }}>
                    Pilihan Paket
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
                            <div key={item.id} className={`item-card animate-fade-in stagger-${(index % 4) + 1}`}>
                                <div className="item-image">
                                    <img
                                        src={item.imageUrl || service.imageUrl || 'https://via.placeholder.com/400x200'}
                                        alt={item.name}
                                    />
                                </div>
                                <div className="item-body">
                                    <h3 className="item-name">{item.name}</h3>
                                    <p className="item-description">{item.description}</p>
                                    <div className="item-details">
                                        <span className="item-price">{formatPrice(item.price)}</span>
                                        {item.duration && (
                                            <span className="item-duration">
                                                ⏱️ {item.duration} menit
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => handleReserve(item)}
                                    >
                                        {user ? 'Reservasi Sekarang' : 'Login untuk Reservasi'}
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
