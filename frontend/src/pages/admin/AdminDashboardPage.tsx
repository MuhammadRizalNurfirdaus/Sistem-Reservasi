import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';
import { reservationsApi, servicesApi } from '../../services/api';
import type { Reservation, Service } from '../../types';

interface DashboardStats {
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    completedReservations: number;
    totalRevenue: number;
    thisMonthRevenue: number;
}

const COLORS = ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [_services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalReservations: 0,
        pendingReservations: 0,
        confirmedReservations: 0,
        completedReservations: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reservationsData, servicesData] = await Promise.all([
                reservationsApi.getAllAdmin(),
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
        const thisMonth = new Date().toISOString().slice(0, 7);
        const completedOrConfirmed = data.filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED');

        setStats({
            totalReservations: data.length,
            pendingReservations: data.filter(r => r.status === 'PENDING').length,
            confirmedReservations: data.filter(r => r.status === 'CONFIRMED').length,
            completedReservations: data.filter(r => r.status === 'COMPLETED').length,
            totalRevenue: completedOrConfirmed.reduce((sum, r) => sum + parseFloat(String(r.serviceItem?.price || 0)), 0),
            thisMonthRevenue: completedOrConfirmed
                .filter(r => r.date.slice(0, 7) === thisMonth)
                .reduce((sum, r) => sum + parseFloat(String(r.serviceItem?.price || 0)), 0)
        });
    };

    const formatPrice = (price: number) => {
        if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(1)}jt`;
        if (price >= 1000) return `Rp ${(price / 1000).toFixed(0)}rb`;
        return `Rp ${price}`;
    };

    // Generate weekly bookings data from real reservations
    const getWeeklyBookingsData = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        
        reservations.forEach(r => {
            const day = new Date(r.date).getDay();
            dayCount[day]++;
        });

        return [1, 2, 3, 4, 5, 6, 0].map(dayNum => ({
            name: days[dayNum],
            bookings: dayCount[dayNum]
        }));
    };

    // Generate service distribution data
    const getServiceDistribution = () => {
        const serviceCount: Record<string, number> = {};
        
        reservations.forEach(r => {
            const serviceName = r.serviceItem?.service?.name || 'Lainnya';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });

        return Object.entries(serviceCount).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);
    };

    const bookingsData = getWeeklyBookingsData();
    const serviceData = getServiceDistribution();

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>Data real-time dari sistem reservasi.</p>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <StatsCard title="Total Pendapatan" value={formatPrice(stats.totalRevenue)} icon="💰" subtitle={`Bulan ini: ${formatPrice(stats.thisMonthRevenue)}`} />
                <StatsCard title="Total Reservasi" value={String(stats.totalReservations)} icon="📅" subtitle={`${stats.confirmedReservations} dikonfirmasi`} />
                <StatsCard title="Pending" value={String(stats.pendingReservations)} icon="⏳" subtitle="Menunggu konfirmasi" warning={stats.pendingReservations > 0} />
                <StatsCard title="Selesai" value={String(stats.completedReservations)} icon="✅" subtitle={`${stats.totalReservations > 0 ? ((stats.completedReservations / stats.totalReservations) * 100).toFixed(0) : 0}% sukses rate`} />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
                        Statistik Reservasi per Hari
                        <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--gray-500)', marginLeft: '8px' }}>
                            (Total: {reservations.length})
                        </span>
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookingsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="bookings" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Distribusi Layanan</h3>
                    <div style={{ height: '300px' }}>
                        {serviceData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={serviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {serviceData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                                    {serviceData.map((entry, index) => (
                                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                            {entry.name} ({entry.value})
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
                                Belum ada data reservasi
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Reservations */}
            <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Reservasi Terbaru</h3>
                {reservations.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>PELANGGAN</th>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>LAYANAN</th>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>TANGGAL</th>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>HARGA</th>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.slice(0, 5).map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={{ padding: '12px 8px' }}>
                                            <div style={{ fontWeight: 500 }}>{res.user?.name || 'Pelanggan'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{res.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <div>{res.serviceItem?.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{res.serviceItem?.service?.name}</div>
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                                            {new Date(res.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(String(res.serviceItem?.price || 0)))}
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <StatusBadge status={res.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                        Belum ada reservasi
                    </div>
                )}
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, subtitle, warning }: { title: string; value: string; icon: string; subtitle?: string; warning?: boolean }) {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {icon}
                </div>
                {subtitle && (
                    <div style={{ padding: '4px 8px', borderRadius: '20px', background: warning ? '#fef3c7' : 'var(--gray-100)', color: warning ? '#92400e' : 'var(--gray-600)', fontSize: '11px', fontWeight: 500 }}>
                        {subtitle}
                    </div>
                )}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>{value}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
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
}
