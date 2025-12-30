import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationsApi } from '../services/api';
import type { Reservation } from '../types';
import { useAuth } from '../hooks/useAuth';
import ReservationCard from '../components/ReservationCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyReservationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchReservations = async () => {
            try {
                const data = await reservationsApi.getAll();
                setReservations(data);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat reservasi.');
                console.error('Error fetching reservations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, [user, navigate]);

    const handleCancel = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) return;

        try {
            await reservationsApi.cancel(id);
            setReservations(prev =>
                prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' as const } : r)
            );
        } catch (err: any) {
            alert(err.message || 'Gagal membatalkan reservasi.');
        }
    };

    // Group reservations by status
    const pendingReservations = reservations.filter(r => r.status === 'PENDING');
    const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED');
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED');
    const cancelledReservations = reservations.filter(r => r.status === 'CANCELLED');

    if (loading) {
        return (
            <div className="page-wrapper">
                <LoadingSpinner text="Memuat reservasi Anda..." />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="dashboard-header">
                <div className="container">
                    <h1 className="dashboard-welcome">Reservasi Saya</h1>
                    <p className="dashboard-subtitle">Kelola semua reservasi Anda di sini</p>
                </div>
            </div>

            <section className="section container">
                {/* Stats */}
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-value">{pendingReservations.length}</div>
                        <div className="stat-label">Menunggu</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{confirmedReservations.length}</div>
                        <div className="stat-label">Dikonfirmasi</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎉</div>
                        <div className="stat-value">{completedReservations.length}</div>
                        <div className="stat-label">Selesai</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{reservations.length}</div>
                        <div className="stat-label">Total</div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        ⚠️ {error}
                    </div>
                )}

                {reservations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h2 className="empty-title">Belum Ada Reservasi</h2>
                        <p className="empty-description">
                            Anda belum memiliki reservasi. Mulai booking layanan sekarang!
                        </p>
                        <Link to="/services" className="btn btn-primary">
                            Lihat Layanan →
                        </Link>
                    </div>
                ) : (
                    <div>
                        {/* Pending Reservations */}
                        {pendingReservations.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-800)' }}>
                                    ⏳ Menunggu Konfirmasi
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {pendingReservations.map(reservation => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                            onCancel={handleCancel}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Confirmed Reservations */}
                        {confirmedReservations.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-800)' }}>
                                    ✅ Dikonfirmasi
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {confirmedReservations.map(reservation => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Reservations */}
                        {completedReservations.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-800)' }}>
                                    🎉 Selesai
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {completedReservations.map(reservation => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancelled Reservations */}
                        {cancelledReservations.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-400)' }}>
                                    ❌ Dibatalkan
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.7 }}>
                                    {cancelledReservations.map(reservation => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
