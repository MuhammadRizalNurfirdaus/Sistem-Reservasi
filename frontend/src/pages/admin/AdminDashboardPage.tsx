import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    // const [stats, setStats] = useState({ ... }); // Unused for now

    const bookingsData = [
        { name: 'Senin', bookings: 4 },
        { name: 'Selasa', bookings: 3 },
        { name: 'Rabu', bookings: 7 },
        { name: 'Kamis', bookings: 5 },
        { name: 'Jumat', bookings: 12 },
        { name: 'Sabtu', bookings: 20 },
        { name: 'Minggu', bookings: 18 },
    ];

    const serviceData = [
        { name: 'Salon', value: 45 },
        { name: 'Prasmanan', value: 30 },
        { name: 'Riasan', value: 25 },
    ];

    const COLORS = ['#ec4899', '#8b5cf6', '#f59e0b'];

    useEffect(() => {
        // Mock loading
        setTimeout(() => setLoading(false), 1000);
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>Welcome back, here's what's happening today.</p>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <StatsCard title="Total Pendapatan" value="Rp 25.5jt" change="+12.5%" icon="💰" />
                <StatsCard title="Total Reservasi" value="128" change="+8.2%" icon="📅" />
                <StatsCard title="Pending" value="12" change="-2.4%" icon="⏳" />
                <StatsCard title="Pelanggan Baru" value="45" change="+5.1%" icon="👥" />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Statistik Reservasi Mingguan</h3>
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
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                            {serviceData.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, change, icon }: any) {
    const isPositive = change.startsWith('+');
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {icon}
                </div>
                <div style={{ padding: '4px 8px', borderRadius: '20px', background: isPositive ? 'var(--success-50)' : 'var(--error-50)', color: isPositive ? 'var(--success)' : 'var(--error)', fontSize: '12px', fontWeight: 600 }}>
                    {change}
                </div>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>{value}</div>
        </div>
    );
}
