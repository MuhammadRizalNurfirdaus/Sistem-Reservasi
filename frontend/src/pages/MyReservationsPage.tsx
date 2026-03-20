import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationsApi } from '../services/api';
import type { Reservation } from '../types';
import { useAuth } from '../hooks/useAuth';
import ReservationCard from '../components/ReservationCard';
import LoadingSpinner from '../components/LoadingSpinner';

type FilterTab = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: 'all', label: 'Semua', icon: '📋' },
    { key: 'PENDING', label: 'Menunggu', icon: '⏳' },
    { key: 'CONFIRMED', label: 'Dikonfirmasi', icon: '✅' },
    { key: 'COMPLETED', label: 'Selesai', icon: '🎉' },
    { key: 'CANCELLED', label: 'Dibatalkan', icon: '❌' },
];

export default function MyReservationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        reservationsApi.getAll()
            .then(setReservations)
            .catch((err: Error) => setError(err.message || 'Gagal memuat reservasi.'))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const handleCancel = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) return;
        try {
            await reservationsApi.cancel(id);
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' as const } : r));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Gagal membatalkan reservasi.');
        }
    };

    const filtered = activeTab === 'all' ? reservations : reservations.filter(r => r.status === activeTab);
    const counts = {
        all: reservations.length,
        PENDING: reservations.filter(r => r.status === 'PENDING').length,
        CONFIRMED: reservations.filter(r => r.status === 'CONFIRMED').length,
        COMPLETED: reservations.filter(r => r.status === 'COMPLETED').length,
        CANCELLED: reservations.filter(r => r.status === 'CANCELLED').length,
    };

    if (loading) return <div className="page-wrapper"><LoadingSpinner text="Memuat reservasi Anda..." /></div>;

    return (
        <div className="page-wrapper">
            <div className="dashboard-header">
                <div className="container">
                    <h1 className="dashboard-welcome">Reservasi Saya</h1>
                    <p className="dashboard-subtitle">Kelola semua reservasi Anda di sini</p>
                </div>
            </div>

            <section className="section container">
                {/* Stats Cards */}
                <div className="dashboard-stats">
                    <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value">{counts.PENDING}</div><div className="stat-label">Menunggu</div></div>
                    <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{counts.CONFIRMED}</div><div className="stat-label">Dikonfirmasi</div></div>
                    <div className="stat-card"><div className="stat-icon">🎉</div><div className="stat-value">{counts.COMPLETED}</div><div className="stat-label">Selesai</div></div>
                    <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{counts.all}</div><div className="stat-label">Total</div></div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon} {tab.label} ({counts[tab.key]})
                        </button>
                    ))}
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h2 className="empty-title">
                            {activeTab === 'all' ? 'Belum Ada Reservasi' : `Tidak Ada Reservasi ${tabs.find(t => t.key === activeTab)?.label}`}
                        </h2>
                        <p className="empty-description">
                            {activeTab === 'all'
                                ? 'Anda belum memiliki reservasi. Mulai booking layanan sekarang!'
                                : 'Tidak ada reservasi dengan status ini.'}
                        </p>
                        {activeTab === 'all' && (
                            <Link to="/services" className="btn btn-primary">Lihat Layanan →</Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filtered.map((reservation, i) => (
                            <div key={reservation.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <ReservationCard
                                    reservation={reservation}
                                    onCancel={reservation.status === 'PENDING' ? handleCancel : undefined}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
