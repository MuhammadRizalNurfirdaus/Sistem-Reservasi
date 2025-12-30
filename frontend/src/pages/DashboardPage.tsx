import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reservationsApi, servicesApi } from '../services/api';
import type { Reservation, Service } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ReservationCard from '../components/ReservationCard';

export default function DashboardPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reservationsData, servicesData] = await Promise.all([
                    reservationsApi.getAll(),
                    servicesApi.getAll()
                ]);
                setReservations(reservationsData);
                setServices(servicesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const upcomingReservations = reservations
        .filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED')
        .slice(0, 3);

    if (loading) {
        return (
            <div className="page-wrapper">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="dashboard-header">
                <div className="container">
                    <h1 className="dashboard-welcome">
                        Selamat datang, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="dashboard-subtitle">
                        Apa yang ingin Anda booking hari ini?
                    </p>
                </div>
            </div>

            <section className="section container">
                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 3fr', gap: '24px', alignItems: 'start' }}>
                    {/* Sidebar / Profile Card */}
                    <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=ec4899&color=fff`}
                            alt={user?.name}
                            style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '16px', objectFit: 'cover', border: '3px solid var(--primary-100)' }}
                        />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{user?.name}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '20px' }}>{user?.email}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Link to="/profile" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                                ⚙️ Kelola Profil
                            </Link>
                            <Link to="/my-reservations" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                📅 Reservasi Saya
                            </Link>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Quick Stats */}
                        <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-value">
                                    {reservations.filter(r => r.status === 'PENDING').length}
                                </div>
                                <div className="stat-label">Menunggu</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-value">
                                    {reservations.filter(r => r.status === 'CONFIRMED').length}
                                </div>
                                <div className="stat-label">Dikonfirmasi</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎉</div>
                                <div className="stat-value">
                                    {reservations.filter(r => r.status === 'COMPLETED').length}
                                </div>
                                <div className="stat-label">Selesai</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-800)' }}>
                                Booking Cepat
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {services.map(service => (
                                    <Link
                                        key={service.id}
                                        to={`/services/${service.id}`}
                                        className="service-card"
                                        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}
                                    >
                                        <div style={{
                                            fontSize: '40px',
                                            background: 'var(--primary-100)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '12px',
                                            lineHeight: 1
                                        }}>
                                            {service.icon || '🎯'}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '4px' }}>
                                                {service.name}
                                            </h3>
                                            <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                                                {service._count?.items || service.items?.length || 0} paket tersedia
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Reservations */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gray-800)' }}>
                                    Reservasi Mendatang
                                </h2>
                                <Link to="/my-reservations" style={{ fontSize: '14px', color: 'var(--primary-600)', fontWeight: 600 }}>
                                    Lihat Semua →
                                </Link>
                            </div>

                            {upcomingReservations.length === 0 ? (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <div className="empty-icon">📅</div>
                                    <h3 className="empty-title">Belum Ada Reservasi</h3>
                                    <p className="empty-description">
                                        Anda belum memiliki reservasi mendatang.
                                    </p>
                                    <Link to="/services" className="btn btn-primary">
                                        Booking Sekarang →
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {upcomingReservations.map(reservation => (
                                        <ReservationCard key={reservation.id} reservation={reservation} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
