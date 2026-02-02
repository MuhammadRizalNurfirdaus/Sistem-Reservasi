import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { reservationsApi, servicesApi, authApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Reservation, Service } from '../../types';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

interface DashboardStats {
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    totalRevenue: number;
    todayReservations: number;
    thisMonthReservations: number;
    todayRevenue: number;
    thisMonthRevenue: number;
}

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function OwnerDashboardPage() {
    const { user, checkAuth } = useAuth();
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
        thisMonthReservations: 0,
        todayRevenue: 0,
        thisMonthRevenue: 0
    });
    const [dateFilter, setDateFilter] = useState('all');
    
    // Profile state
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

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
        // Set profile form
        setProfileForm({
            name: user.name || '',
            phone: user.phone || '',
            password: '',
            confirmPassword: ''
        });
    }, [user, navigate]);

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
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);

        const completedOrConfirmed = data.filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED');

        const newStats: DashboardStats = {
            totalReservations: data.length,
            pendingReservations: data.filter(r => r.status === 'PENDING').length,
            confirmedReservations: data.filter(r => r.status === 'CONFIRMED').length,
            completedReservations: data.filter(r => r.status === 'COMPLETED').length,
            cancelledReservations: data.filter(r => r.status === 'CANCELLED').length,
            totalRevenue: completedOrConfirmed.reduce((sum, r) => sum + parseFloat(String(r.serviceItem.price)), 0),
            todayReservations: data.filter(r => r.date.split('T')[0] === today).length,
            thisMonthReservations: data.filter(r => r.date.slice(0, 7) === thisMonth).length,
            todayRevenue: completedOrConfirmed.filter(r => r.date.split('T')[0] === today)
                .reduce((sum, r) => sum + parseFloat(String(r.serviceItem.price)), 0),
            thisMonthRevenue: completedOrConfirmed.filter(r => r.date.slice(0, 7) === thisMonth)
                .reduce((sum, r) => sum + parseFloat(String(r.serviceItem.price)), 0)
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

    const formatShortPrice = (price: number) => {
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}jt`;
        if (price >= 1000) return `${(price / 1000).toFixed(0)}rb`;
        return String(price);
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
        const revenueMap: Record<string, { name: string; icon: string; value: number; count: number }> = {};
        
        reservations
            .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
            .forEach(r => {
                const serviceName = r.serviceItem.service.name;
                if (!revenueMap[serviceName]) {
                    revenueMap[serviceName] = {
                        name: serviceName,
                        icon: r.serviceItem.service.icon || '📦',
                        value: 0,
                        count: 0
                    };
                }
                revenueMap[serviceName].value += parseFloat(String(r.serviceItem.price));
                revenueMap[serviceName].count += 1;
            });

        return Object.values(revenueMap).sort((a, b) => b.value - a.value);
    };

    // Chart Data Generators
    const getRevenueByDay = () => {
        const last7Days: Record<string, { date: string; pendapatan: number; reservasi: number }> = {};
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
            last7Days[dateStr] = { date: dayName, pendapatan: 0, reservasi: 0 };
        }

        reservations.forEach(r => {
            const dateStr = r.date.split('T')[0];
            if (last7Days[dateStr]) {
                last7Days[dateStr].reservasi += 1;
                if (r.status === 'COMPLETED' || r.status === 'CONFIRMED') {
                    last7Days[dateStr].pendapatan += parseFloat(String(r.serviceItem.price));
                }
            }
        });

        return Object.values(last7Days);
    };

    const getRevenueByMonth = () => {
        const months: Record<string, { bulan: string; pendapatan: number; reservasi: number }> = {};
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().slice(0, 7);
            const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            months[monthStr] = { bulan: monthName, pendapatan: 0, reservasi: 0 };
        }

        reservations.forEach(r => {
            const monthStr = r.date.slice(0, 7);
            if (months[monthStr]) {
                months[monthStr].reservasi += 1;
                if (r.status === 'COMPLETED' || r.status === 'CONFIRMED') {
                    months[monthStr].pendapatan += parseFloat(String(r.serviceItem.price));
                }
            }
        });

        return Object.values(months);
    };

    const getStatusData = () => [
        { name: 'Menunggu', value: stats.pendingReservations, color: '#f59e0b' },
        { name: 'Dikonfirmasi', value: stats.confirmedReservations, color: '#3b82f6' },
        { name: 'Selesai', value: stats.completedReservations, color: '#10b981' },
        { name: 'Dibatalkan', value: stats.cancelledReservations, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const getTopItems = () => {
        const itemMap: Record<string, { name: string; service: string; count: number; revenue: number }> = {};
        
        reservations
            .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
            .forEach(r => {
                const itemName = r.serviceItem.name;
                if (!itemMap[itemName]) {
                    itemMap[itemName] = {
                        name: itemName,
                        service: r.serviceItem.service?.name || '',
                        count: 0,
                        revenue: 0
                    };
                }
                itemMap[itemName].count += 1;
                itemMap[itemName].revenue += parseFloat(String(r.serviceItem.price));
            });

        return Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 5);
    };

    // Profile handlers
    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (user?.avatar) {
            if (user.avatar.startsWith('http')) return user.avatar;
            return user.avatar;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=f59e0b&color=fff&size=128`;
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setProfileMessage({ type: 'error', text: 'File harus berupa gambar' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setProfileMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Auto upload
        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            await authApi.uploadAvatar(formData);
            await checkAuth();
            setProfileMessage({ type: 'success', text: 'Foto profil berhasil diupdate!' });
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'Gagal upload foto' });
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);

        try {
            if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
                throw new Error('Password tidak cocok');
            }

            const data: any = {
                name: profileForm.name,
                phone: profileForm.phone
            };

            if (profileForm.password) {
                data.password = profileForm.password;
            }

            await authApi.updateProfile(data);
            await checkAuth();
            setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'Gagal memperbarui profil' });
        } finally {
            setProfileLoading(false);
        }
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
        { id: 'analytics', label: '📈 Analitik', icon: '📈' },
        { id: 'reservations', label: '📋 Reservasi', icon: '📋' },
        { id: 'profile', label: '👤 Profil', icon: '👤' }
    ];

    const revenueByDay = getRevenueByDay();
    const revenueByMonth = getRevenueByMonth();
    const revenueByService = getRevenueByService();
    const statusData = getStatusData();
    const topItems = getTopItems();

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                color: 'white',
                padding: '20px 0'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '28px' }}>👑</div>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Owner Dashboard</h1>
                        <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>Laporan & Statistik Bisnis</p>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '24px', borderRadius: '20px', color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>💰 Total Pendapatan</div>
                                        <div style={{ fontSize: '26px', fontWeight: 800 }}>{formatPrice(stats.totalRevenue)}</div>
                                    </div>
                                    <div style={{ fontSize: '36px', opacity: 0.3 }}>💵</div>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.9 }}>
                                    Hari ini: {formatPrice(stats.todayRevenue)}
                                </div>
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '24px', borderRadius: '20px', color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📅 Total Reservasi</div>
                                        <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.totalReservations}</div>
                                    </div>
                                    <div style={{ fontSize: '36px', opacity: 0.3 }}>📊</div>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.9 }}>
                                    Hari ini: {stats.todayReservations} | Bulan ini: {stats.thisMonthReservations}
                                </div>
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '24px', borderRadius: '20px', color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>✅ Selesai</div>
                                        <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.completedReservations}</div>
                                    </div>
                                    <div style={{ fontSize: '36px', opacity: 0.3 }}>🎉</div>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.9 }}>
                                    {stats.totalReservations > 0 ? ((stats.completedReservations / stats.totalReservations) * 100).toFixed(1) : 0}% completion rate
                                </div>
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '24px', borderRadius: '20px', color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>🛎️ Layanan Aktif</div>
                                        <div style={{ fontSize: '36px', fontWeight: 800 }}>{services.length}</div>
                                    </div>
                                    <div style={{ fontSize: '36px', opacity: 0.3 }}>📦</div>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.9 }}>
                                    {services.reduce((sum, s) => sum + (s.items?.length || 0), 0)} item tersedia
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            {/* Revenue Chart */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📈 Pendapatan 7 Hari Terakhir</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={revenueByDay}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatShortPrice(v)} />
                                        <Tooltip 
                                            formatter={(value) => [formatPrice(Number(value)), 'Pendapatan']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="pendapatan" stroke="#10b981" strokeWidth={3} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Status Pie Chart */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>🍰 Status Reservasi</h3>
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Reservasi']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        Belum ada data
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Items & Recent */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                            {/* Top Items */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>🏆 Top 5 Layanan Terpopuler</h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {topItems.map((item, index) => (
                                        <div key={item.name} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '16px',
                                            background: index === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#f8fafc',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7c32' : '#e5e7eb',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                fontSize: '16px'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.service}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: '#1e3a5f' }}>{item.count}x dipesan</div>
                                                <div style={{ fontSize: '13px', color: '#059669' }}>{formatPrice(item.revenue)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {topItems.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            Belum ada data
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Breakdown */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📊 Status Breakdown</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#fef3c7', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#92400e' }}>{stats.pendingReservations}</div>
                                        <div style={{ fontSize: '14px', color: '#92400e' }}>⏳ Menunggu</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#dbeafe', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e40af' }}>{stats.confirmedReservations}</div>
                                        <div style={{ fontSize: '14px', color: '#1e40af' }}>✅ Dikonfirmasi</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#d1fae5', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#065f46' }}>{stats.completedReservations}</div>
                                        <div style={{ fontSize: '14px', color: '#065f46' }}>🎉 Selesai</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#fee2e2', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#991b1b' }}>{stats.cancelledReservations}</div>
                                        <div style={{ fontSize: '14px', color: '#991b1b' }}>❌ Dibatalkan</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revenue Tab */}
                {activeTab === 'revenue' && (
                    <div>
                        {/* Revenue Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💰</div>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Total Pendapatan</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669' }}>{formatPrice(stats.totalRevenue)}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📅</div>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Pendapatan Hari Ini</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1d4ed8' }}>{formatPrice(stats.todayRevenue)}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📆</div>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Pendapatan Bulan Ini</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed' }}>{formatPrice(stats.thisMonthRevenue)}</div>
                            </div>
                        </div>

                        {/* Monthly Revenue Chart */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>📊 Pendapatan 6 Bulan Terakhir</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={revenueByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatShortPrice(v)} />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'pendapatan' ? formatPrice(Number(value)) : value,
                                            name === 'pendapatan' ? 'Pendapatan' : 'Reservasi'
                                        ]}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="pendapatan" name="Pendapatan" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="reservasi" name="Jumlah Reservasi" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue by Service */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>🍰 Pendapatan per Layanan</h3>
                                {revenueByService.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={revenueByService}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {revenueByService.map((_, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Pendapatan']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        Belum ada data pendapatan
                                    </div>
                                )}
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>📋 Detail Pendapatan per Layanan</h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {revenueByService.map((service) => (
                                        <div key={service.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '28px' }}>{service.icon}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{service.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{service.count} reservasi</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: '#059669' }}>{formatPrice(service.value)}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {stats.totalRevenue > 0 ? ((service.value / stats.totalRevenue) * 100).toFixed(1) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {revenueByService.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            Belum ada data pendapatan
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div>
                        {/* Trend Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>📈 Tren Reservasi Harian</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={revenueByDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="reservasi" name="Reservasi" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>💹 Tren Pendapatan Harian</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={revenueByDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatShortPrice(v)} />
                                        <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Pendapatan']} />
                                        <Line type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>📊 Metrik Performa</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#be185d' }}>
                                        {stats.totalReservations > 0 ? ((stats.completedReservations / stats.totalReservations) * 100).toFixed(0) : 0}%
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#9d174d', marginTop: '8px' }}>✅ Completion Rate</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#1d4ed8' }}>
                                        {stats.totalReservations > 0 ? ((stats.cancelledReservations / stats.totalReservations) * 100).toFixed(0) : 0}%
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#1e40af', marginTop: '8px' }}>❌ Cancellation Rate</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
                                        {formatPrice(stats.totalRevenue / (stats.completedReservations + stats.confirmedReservations || 1))}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#047857', marginTop: '8px' }}>💵 Rata-rata per Order</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #fefce8, #fef3c7)', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#b45309' }}>
                                        {services.length > 0 ? (stats.totalReservations / services.length).toFixed(1) : 0}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#92400e', marginTop: '8px' }}>📦 Order per Layanan</div>
                                </div>
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
                                {filteredReservations.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                        <div>Belum ada reservasi</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>👤 Profil Owner</h3>
                            
                            {profileMessage && (
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    background: profileMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                                    color: profileMessage.type === 'success' ? '#065f46' : '#991b1b',
                                    fontSize: '14px'
                                }}>
                                    {profileMessage.text}
                                </div>
                            )}

                            {/* Avatar */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={getAvatarUrl()}
                                        alt={user?.name}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid #f59e0b'
                                        }}
                                    />
                                    {avatarUploading && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ color: 'white', fontSize: '14px' }}>Uploading...</div>
                                        </div>
                                    )}
                                    <label style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: '#f59e0b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '3px solid white',
                                        fontSize: '16px'
                                    }}>
                                        📷
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '18px' }}>{user?.name}</div>
                                <div style={{ color: '#6b7280', fontSize: '14px' }}>{user?.email}</div>
                                <div style={{ 
                                    display: 'inline-block',
                                    marginTop: '8px',
                                    padding: '4px 12px', 
                                    background: '#fef3c7', 
                                    color: '#92400e', 
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 600
                                }}>
                                    👑 OWNER
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleProfileSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '15px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                                        No. Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '15px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                                        Password Baru (kosongkan jika tidak ingin ganti)
                                    </label>
                                    <input
                                        type="password"
                                        value={profileForm.password}
                                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '15px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {profileForm.password && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                                            Konfirmasi Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={profileForm.confirmPassword}
                                            onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '15px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        cursor: profileLoading ? 'not-allowed' : 'pointer',
                                        opacity: profileLoading ? 0.7 : 1
                                    }}
                                >
                                    {profileLoading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
