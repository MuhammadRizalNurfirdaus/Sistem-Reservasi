import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { reservationsApi, servicesApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Reservation, Service } from '../../types';

interface DashboardStats {
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    totalRevenue: number;
    todayReservations: number;
    thisMonthReservations: number;
}

export default function OwnerDashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalReservations: 0,
        pendingReservations: 0,
        confirmedReservations: 0,
        completedReservations: 0,
        cancelledReservations: 0,
        totalRevenue: 0,
        todayReservations: 0,
        thisMonthReservations: 0
    });
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [reservationsData, servicesData] = await Promise.all([
                reservationsApi.getAll(),
                servicesApi.getAll()
            ]);
            
            setReservations(reservationsData);
            setServices(servicesData);
            calculateStats(reservationsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Reservation[]) => {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);

        const newStats: DashboardStats = {
            totalReservations: data.length,
            pendingReservations: data.filter(r => r.status === 'PENDING').length,
            confirmedReservations: data.filter(r => r.status === 'CONFIRMED').length,
            completedReservations: data.filter(r => r.status === 'COMPLETED').length,
            cancelledReservations: data.filter(r => r.status === 'CANCELLED').length,
            totalRevenue: data
                .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
                .reduce((sum, r) => sum + parseFloat(String(r.serviceItem.price)), 0),
            todayReservations: data.filter(r => r.date.split('T')[0] === today).length,
            thisMonthReservations: data.filter(r => r.date.slice(0, 7) === thisMonth).length
        };

        setStats(newStats);
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; label: string }> = {
            PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Menunggu' },
            CONFIRMED: { bg: '#dbeafe', color: '#1e40af', label: 'Dikonfirmasi' },
            COMPLETED: { bg: '#d1fae5', color: '#065f46', label: 'Selesai' },
            CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Dibatalkan' }
        };
        const style = styles[status] || styles.PENDING;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: style.bg,
                color: style.color
            }}>
                {style.label}
            </span>
        );
    };

    const filteredReservations = reservations.filter(r => {
        if (dateFilter === 'all') return true;
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);
        if (dateFilter === 'today') return r.date.split('T')[0] === today;
        if (dateFilter === 'month') return r.date.slice(0, 7) === thisMonth;
        return true;
    });

    const getRevenueByService = () => {
        const revenueMap: Record<string, { name: string; icon: string; revenue: number; count: number }> = {};
        
        reservations
            .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
            .forEach(r => {
                const serviceName = r.serviceItem.service.name;
                if (!revenueMap[serviceName]) {
                    revenueMap[serviceName] = {
                        name: serviceName,
                        icon: r.serviceItem.service.icon || '📦',
                        revenue: 0,
                        count: 0
                    };
                }
                revenueMap[serviceName].revenue += parseFloat(String(r.serviceItem.price));
                revenueMap[serviceName].count += 1;
            });

        return Object.values(revenueMap).sort((a, b) => b.revenue - a.revenue);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <LoadingSpinner />
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: '📊 Ringkasan', icon: '📊' },
        { id: 'revenue', label: '💰 Pendapatan', icon: '💰' },
        { id: 'reservations', label: '📋 Reservasi', icon: '📋' },
        { id: 'services', label: '🛎️ Layanan', icon: '🛎️' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                color: 'white',
                padding: '20px 0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '28px' }}>👑</div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Owner Dashboard</h1>
                            <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>Laporan & Statistik Bisnis</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>{user?.name}</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>Owner</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === tab.id ? '#1e3a5f' : 'white',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(30,58,95,0.3)' : '0 1px 3px rgba(0,0,0,0.08)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Reservasi</div>
                                <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.totalReservations}</div>
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Pendapatan</div>
                                <div style={{ fontSize: '28px', fontWeight: 800 }}>{formatPrice(stats.totalRevenue)}</div>
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Hari Ini</div>
                                <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.todayReservations}</div>
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Bulan Ini</div>
                                <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.thisMonthReservations}</div>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📈 Status Reservasi</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                <div style={{ textAlign: 'center', padding: '20px', background: '#fef3c7', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#92400e' }}>{stats.pendingReservations}</div>
                                    <div style={{ fontSize: '14px', color: '#92400e' }}>Menunggu</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '20px', background: '#dbeafe', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e40af' }}>{stats.confirmedReservations}</div>
                                    <div style={{ fontSize: '14px', color: '#1e40af' }}>Dikonfirmasi</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '20px', background: '#d1fae5', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#065f46' }}>{stats.completedReservations}</div>
                                    <div style={{ fontSize: '14px', color: '#065f46' }}>Selesai</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '20px', background: '#fee2e2', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#991b1b' }}>{stats.cancelledReservations}</div>
                                    <div style={{ fontSize: '14px', color: '#991b1b' }}>Dibatalkan</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reservations */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>🕐 Reservasi Terbaru</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Customer</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Layanan</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Tanggal</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Harga</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.slice(0, 10).map(res => (
                                            <tr key={res.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 600 }}>{res.user.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{res.user.email}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>{res.serviceItem.service.icon}</span>
                                                        <span>{res.serviceItem.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>{formatDate(res.date)} • {res.time}</td>
                                                <td style={{ padding: '12px', fontWeight: 600, color: '#059669' }}>
                                                    {formatPrice(res.serviceItem.price)}
                                                </td>
                                                <td style={{ padding: '12px' }}>{getStatusBadge(res.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revenue Tab */}
                {activeTab === 'revenue' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '32px', borderRadius: '20px', color: 'white' }}>
                                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '12px' }}>💰 Total Pendapatan</div>
                                <div style={{ fontSize: '42px', fontWeight: 800 }}>{formatPrice(stats.totalRevenue)}</div>
                                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
                                    Dari {stats.completedReservations + stats.confirmedReservations} reservasi sukses
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>📊 Rata-rata per Transaksi</div>
                                <div style={{ fontSize: '42px', fontWeight: 800, color: '#1e3a5f' }}>
                                    {formatPrice(stats.totalRevenue / Math.max(stats.completedReservations + stats.confirmedReservations, 1))}
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>💼 Pendapatan per Layanan</h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {getRevenueByService().map((item, index) => (
                                    <div key={index} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        padding: '20px',
                                        background: '#f8fafc',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ fontSize: '32px' }}>{item.icon}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '16px' }}>{item.name}</div>
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.count} transaksi</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{formatPrice(item.revenue)}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {((item.revenue / stats.totalRevenue) * 100).toFixed(1)}% dari total
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reservations Tab */}
                {activeTab === 'reservations' && (
                    <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            {['all', 'today', 'month'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setDateFilter(filter)}
                                    style={{
                                        padding: '10px 20px',
                                        background: dateFilter === filter ? '#1e3a5f' : 'white',
                                        color: dateFilter === filter ? 'white' : '#64748b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {filter === 'all' ? 'Semua' : filter === 'today' ? 'Hari Ini' : 'Bulan Ini'}
                                </button>
                            ))}
                        </div>

                        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                                📋 Daftar Reservasi ({filteredReservations.length})
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Customer</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Kontak</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Layanan</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Jadwal</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Harga</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReservations.map(res => (
                                            <tr key={res.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 600 }}>{res.user.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{res.user.email}</div>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '13px' }}>
                                                    {res.contactPhone || res.user.phone || '-'}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>{res.serviceItem.service.icon}</span>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{res.serviceItem.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{res.serviceItem.service.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div>{formatDate(res.date)}</div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{res.time} WIB</div>
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: 600, color: '#059669' }}>
                                                    {formatPrice(res.serviceItem.price)}
                                                </td>
                                                <td style={{ padding: '12px' }}>{getStatusBadge(res.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {services.map(service => (
                            <div key={service.id} style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '36px' }}>{service.icon || '📦'}</div>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{service.name}</h3>
                                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                            {service._count?.items || service.items?.length || 0} item layanan
                                        </p>
                                    </div>
                                </div>
                                {service.items && service.items.length > 0 && (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {service.items.map(item => (
                                            <div key={item.id} style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                padding: '16px',
                                                background: '#f8fafc',
                                                borderRadius: '12px'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                        {(item as any)._count?.reservations || 0} reservasi
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 700, color: '#059669' }}>
                                                    {formatPrice(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
