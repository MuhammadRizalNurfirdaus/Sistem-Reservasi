import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reservationsApi, servicesApi, authApi } from '../services/api';
import type { Reservation, Service } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ReservationCard from '../components/ReservationCard';

type TabType = 'ringkasan' | 'reservasi' | 'profil' | 'alamat' | 'bantuan';

interface Wilayah { id: string; name: string; }

export default function DashboardPage() {
    const { user, checkAuth } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'ringkasan');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Profile form state
    const [isEditing, setIsEditing] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
        // Address fields
        provinsiId: '',
        kabupatenId: '',
        kecamatanId: '',
        desaId: '',
        alamatDetail: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Address data
    const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Wilayah[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Wilayah[]>([]);
    const [desaList, setDesaList] = useState<Wilayah[]>([]);
    const [addressNames, setAddressNames] = useState({ provinsi: '', kabupaten: '', kecamatan: '', desa: '' });

    // Fetch Provinsi
    useEffect(() => {
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then(res => res.json())
            .then(data => setProvinsiList(data))
            .catch(err => console.error('Error fetching provinsi:', err));
    }, []);

    // Fetch Kabupaten
    useEffect(() => {
        if (formData.provinsiId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${formData.provinsiId}.json`)
                .then(res => res.json())
                .then(data => setKabupatenList(data))
                .catch(err => console.error('Error fetching kabupaten:', err));
        }
    }, [formData.provinsiId]);

    // Fetch Kecamatan
    useEffect(() => {
        if (formData.kabupatenId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${formData.kabupatenId}.json`)
                .then(res => res.json())
                .then(data => setKecamatanList(data))
                .catch(err => console.error('Error fetching kecamatan:', err));
        }
    }, [formData.kabupatenId]);

    // Fetch Desa
    useEffect(() => {
        if (formData.kecamatanId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${formData.kecamatanId}.json`)
                .then(res => res.json())
                .then(data => setDesaList(data))
                .catch(err => console.error('Error fetching desa:', err));
        }
    }, [formData.kecamatanId]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                password: '',
                confirmPassword: '',
                provinsiId: '',
                kabupatenId: '',
                kecamatanId: '',
                desaId: '',
                alamatDetail: user.address || ''
            });
        }
    }, [user]);

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

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarUploading(true);
            // Simulate upload animation
            setTimeout(() => setAvatarUploading(false), 1000);
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'provinsiId') {
            const prov = provinsiList.find(p => p.id === value);
            setAddressNames(prev => ({ ...prev, provinsi: prov?.name || '', kabupaten: '', kecamatan: '', desa: '' }));
            setFormData(prev => ({ ...prev, provinsiId: value, kabupatenId: '', kecamatanId: '', desaId: '' }));
            setKabupatenList([]);
            setKecamatanList([]);
            setDesaList([]);
        } else if (name === 'kabupatenId') {
            const kab = kabupatenList.find(k => k.id === value);
            setAddressNames(prev => ({ ...prev, kabupaten: kab?.name || '', kecamatan: '', desa: '' }));
            setFormData(prev => ({ ...prev, kabupatenId: value, kecamatanId: '', desaId: '' }));
            setKecamatanList([]);
            setDesaList([]);
        } else if (name === 'kecamatanId') {
            const kec = kecamatanList.find(k => k.id === value);
            setAddressNames(prev => ({ ...prev, kecamatan: kec?.name || '', desa: '' }));
            setFormData(prev => ({ ...prev, kecamatanId: value, desaId: '' }));
            setDesaList([]);
        } else if (name === 'desaId') {
            const des = desaList.find(d => d.id === value);
            setAddressNames(prev => ({ ...prev, desa: des?.name || '' }));
            setFormData(prev => ({ ...prev, desaId: value }));
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setMessage(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            
            // Build full address
            const fullAddress = [
                formData.alamatDetail,
                addressNames.desa ? `Desa ${addressNames.desa}` : '',
                addressNames.kecamatan ? `Kec. ${addressNames.kecamatan}` : '',
                addressNames.kabupaten,
                addressNames.provinsi
            ].filter(Boolean).join(', ') || formData.address;
            
            data.append('address', fullAddress);
            
            if (formData.password) {
                if (formData.password !== formData.confirmPassword) {
                    setMessage({ type: 'error', text: 'Password konfirmasi tidak sesuai!' });
                    setProfileLoading(false);
                    return;
                }
                data.append('password', formData.password);
                data.append('confirmPassword', formData.confirmPassword);
            }
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            await authApi.updateProfile(data);
            await checkAuth();
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Gagal memperbarui profil' });
        } finally {
            setProfileLoading(false);
        }
    };

    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (user?.avatar) {
            if (user.avatar.startsWith('http')) return user.avatar;
            return user.avatar;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=ec4899&color=fff&size=128`;
    };

    const handleCancelReservation = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) return;
        
        try {
            await reservationsApi.cancel(id);
            setReservations(prev => prev.map(r => 
                r.id === id ? { ...r, status: 'CANCELLED' as const } : r
            ));
            setMessage({ type: 'success', text: 'Reservasi berhasil dibatalkan' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Gagal membatalkan reservasi' });
        }
    };

    const pendingReservations = reservations.filter(r => r.status === 'PENDING');
    const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED');
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED');

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2>Silakan login terlebih dahulu</h2>
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Login</Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                </div>
                <Footer />
            </div>
        );
    }

    const tabs = [
        { id: 'ringkasan', label: '📊 Ringkasan', icon: '📊' },
        { id: 'reservasi', label: '📅 Reservasi Saya', icon: '📅' },
        { id: 'profil', label: '👤 Profil', icon: '👤' },
        { id: 'alamat', label: '📍 Alamat', icon: '📍' },
        { id: 'bantuan', label: '❓ Bantuan & Ketentuan', icon: '❓' },
    ];

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--gray-50)' }}>
            <Navbar />

            {/* Owner Banner */}
            {user.role === 'OWNER' && (
                <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                    padding: '12px 0',
                    textAlign: 'center'
                }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                        <span style={{ color: 'white', fontWeight: 600 }}>👑 Anda login sebagai Owner</span>
                        <Link 
                            to="/owner" 
                            style={{ 
                                padding: '8px 20px', 
                                background: 'white', 
                                color: '#d97706', 
                                borderRadius: '20px', 
                                fontWeight: 700,
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            Buka Dashboard Owner →
                        </Link>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', padding: '32px 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img
                            src={getAvatarUrl()}
                            alt={user.name}
                            style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid white', objectFit: 'cover' }}
                        />
                        <div>
                            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: 0 }}>
                                Selamat datang, {user.name.split(' ')[0]}! 👋
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: '60px', zIndex: 10 }}>
                <div className="container">
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 0' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as TabType)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'var(--primary-500)' : 'var(--gray-100)',
                                    color: activeTab === tab.id ? 'white' : 'var(--gray-600)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main style={{ flex: 1, padding: '32px 0' }}>
                <div className="container">
                    
                    {/* Tab: Ringkasan */}
                    {activeTab === 'ringkasan' && (
                        <div>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--warning-500)' }}>{pendingReservations.length}</div>
                                    <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Menunggu</div>
                                </div>
                                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success-500)' }}>{confirmedReservations.length}</div>
                                    <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Dikonfirmasi</div>
                                </div>
                                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--primary-500)' }}>{completedReservations.length}</div>
                                    <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Selesai</div>
                                </div>
                                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--gray-700)' }}>{reservations.length}</div>
                                    <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Total Reservasi</div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>🚀 Booking Cepat</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                {services.map(service => (
                                    <Link 
                                        key={service.id} 
                                        to={`/services/${service.id}`}
                                        style={{ 
                                            background: 'white', 
                                            padding: '20px', 
                                            borderRadius: '16px', 
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '40px' }}>{service.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{service.name}</div>
                                            <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{service.items?.length || 0} paket tersedia</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Recent Reservations */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>📋 Reservasi Terbaru</h2>
                                <button onClick={() => handleTabChange('reservasi')} className="btn btn-outline btn-sm">
                                    Lihat Semua →
                                </button>
                            </div>
                            {reservations.length === 0 ? (
                                <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                                    <h3 style={{ marginBottom: '8px' }}>Belum Ada Reservasi</h3>
                                    <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Mulai booking layanan favorit Anda sekarang!</p>
                                    <Link to="/services" className="btn btn-primary">Lihat Layanan</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {reservations.slice(0, 3).map(reservation => (
                                        <ReservationCard key={reservation.id} reservation={reservation} onCancel={handleCancelReservation} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Reservasi Saya */}
                    {activeTab === 'reservasi' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>📅 Riwayat Reservasi</h2>
                                <Link to="/services" className="btn btn-primary">+ Reservasi Baru</Link>
                            </div>

                            {reservations.length === 0 ? (
                                <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                                    <h3 style={{ marginBottom: '8px' }}>Belum Ada Reservasi</h3>
                                    <p style={{ color: 'var(--gray-500)' }}>Anda belum memiliki riwayat reservasi.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {reservations.map(reservation => (
                                        <ReservationCard key={reservation.id} reservation={reservation} onCancel={handleCancelReservation} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Profil */}
                    {activeTab === 'profil' && (
                        <div style={{ maxWidth: '700px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>👤 Profil Saya</h2>

                            {message && (
                                <div style={{
                                    padding: '16px', borderRadius: '12px', marginBottom: '24px',
                                    background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                                    color: message.type === 'success' ? '#065f46' : '#991b1b'
                                }}>
                                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                                </div>
                            )}

                            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                                {!isEditing ? (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                            <img src={getAvatarUrl()} alt={user.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }} />
                                            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{user.name}</h3>
                                            <span style={{ background: 'var(--primary-100)', color: 'var(--primary-600)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>{user.role}</span>
                                        </div>
                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>📧 Email</div>
                                                    <div style={{ fontWeight: 600 }}>{user.email}</div>
                                                </div>
                                                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
                                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>📱 Telepon</div>
                                                    <div style={{ fontWeight: 600, color: user.phone ? 'inherit' : 'var(--gray-400)' }}>{user.phone || 'Belum diisi'}</div>
                                                </div>
                                            </div>
                                            <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>📍 Alamat</div>
                                                <div style={{ fontWeight: 600, color: user.address ? 'inherit' : 'var(--gray-400)' }}>
                                                    {user.address ? (() => {
                                                        try {
                                                            const addr = JSON.parse(user.address);
                                                            return `${addr.street || ''}, ${addr.kelurahan || ''}, ${addr.kecamatan || ''}, ${addr.city || ''}, ${addr.province || ''}`;
                                                        } catch {
                                                            return user.address;
                                                        }
                                                    })() : 'Belum diisi'}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }}>
                                            ✏️ Edit Profil
                                        </button>
                                    </>
                                ) : (
                                    <form onSubmit={handleProfileSubmit}>
                                        {/* Avatar with overlay button */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <img 
                                                    src={getAvatarUrl()} 
                                                    alt={user.name} 
                                                    style={{ 
                                                        width: '100px', 
                                                        height: '100px', 
                                                        borderRadius: '50%', 
                                                        objectFit: 'cover',
                                                        border: '3px solid var(--primary-200)'
                                                    }} 
                                                />
                                                {avatarUploading && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            border: '3px solid white',
                                                            borderTopColor: 'transparent',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite'
                                                        }} />
                                                    </div>
                                                )}
                                                <label style={{
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    right: '0',
                                                    background: 'var(--primary-500)',
                                                    color: 'white',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    border: '2px solid white',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                    transition: 'transform 0.2s'
                                                }}>
                                                    <span style={{ fontSize: '14px' }}>📷</span>
                                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                                </label>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{user.name}</h3>
                                                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>{user.email}</p>
                                                {avatarFile && (
                                                    <span style={{ 
                                                        display: 'inline-block',
                                                        marginTop: '8px',
                                                        fontSize: '12px', 
                                                        color: 'var(--success-600)',
                                                        background: 'var(--success-50)',
                                                        padding: '4px 8px',
                                                        borderRadius: '8px'
                                                    }}>
                                                        ✅ Foto baru dipilih
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">👤 Nama Lengkap</label>
                                                <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">📱 Telepon</label>
                                                    <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08xxxxxxxxxx" />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">📧 Email</label>
                                                    <input className="form-input" value={user.email} disabled style={{ background: 'var(--gray-100)' }} />
                                                </div>
                                            </div>
                                            
                                            {/* Alamat Lengkap Section */}
                                            <div style={{ 
                                                background: 'var(--gray-50)', 
                                                padding: '20px', 
                                                borderRadius: '12px',
                                                border: '1px solid var(--gray-200)'
                                            }}>
                                                <label className="form-label" style={{ marginBottom: '16px', display: 'block' }}>
                                                    📍 Alamat Lengkap
                                                </label>
                                                
                                                {/* Provinsi & Kabupaten */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                    <select
                                                        name="provinsiId"
                                                        className="form-input"
                                                        value={formData.provinsiId}
                                                        onChange={handleAddressChange}
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        <option value="">-- Pilih Provinsi --</option>
                                                        {provinsiList.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        name="kabupatenId"
                                                        className="form-input"
                                                        value={formData.kabupatenId}
                                                        onChange={handleAddressChange}
                                                        disabled={!formData.provinsiId}
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        <option value="">-- Kota/Kabupaten --</option>
                                                        {kabupatenList.map(k => (
                                                            <option key={k.id} value={k.id}>{k.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Kecamatan & Desa */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                    <select
                                                        name="kecamatanId"
                                                        className="form-input"
                                                        value={formData.kecamatanId}
                                                        onChange={handleAddressChange}
                                                        disabled={!formData.kabupatenId}
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        <option value="">-- Kecamatan --</option>
                                                        {kecamatanList.map(k => (
                                                            <option key={k.id} value={k.id}>{k.name}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        name="desaId"
                                                        className="form-input"
                                                        value={formData.desaId}
                                                        onChange={handleAddressChange}
                                                        disabled={!formData.kecamatanId}
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        <option value="">-- Desa/Kelurahan --</option>
                                                        {desaList.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Detail Alamat */}
                                                <textarea 
                                                    className="form-input" 
                                                    value={formData.alamatDetail} 
                                                    onChange={e => setFormData({...formData, alamatDetail: e.target.value})} 
                                                    rows={2}
                                                    placeholder="Nama jalan, RT/RW, nomor rumah, patokan..."
                                                    style={{ fontSize: '14px', resize: 'none' }}
                                                />
                                                
                                                {/* Preview alamat */}
                                                {(addressNames.provinsi || formData.alamatDetail) && (
                                                    <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', fontSize: '13px' }}>
                                                        <span style={{ color: 'var(--gray-500)' }}>Preview: </span>
                                                        <span style={{ color: 'var(--gray-700)' }}>
                                                            {[
                                                                formData.alamatDetail,
                                                                addressNames.desa ? `Desa ${addressNames.desa}` : '',
                                                                addressNames.kecamatan ? `Kec. ${addressNames.kecamatan}` : '',
                                                                addressNames.kabupaten,
                                                                addressNames.provinsi
                                                            ].filter(Boolean).join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
                                                <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '12px' }}>🔐 Ganti Password (Kosongkan jika tidak ingin ubah)</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <input type="password" className="form-input" placeholder="Password baru" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                                    <input type="password" className="form-input" placeholder="Konfirmasi password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1 }}>Batal</button>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={profileLoading}>
                                                {profileLoading ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            width: '16px',
                                                            height: '16px',
                                                            border: '2px solid white',
                                                            borderTopColor: 'transparent',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite',
                                                            display: 'inline-block'
                                                        }} />
                                                        Menyimpan...
                                                    </span>
                                                ) : '💾 Simpan'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Alamat */}
                    {activeTab === 'alamat' && (
                        <div style={{ maxWidth: '700px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>📍 Alamat Reservasi</h2>
                            
                            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>🏠 Alamat Utama</h3>
                                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Alamat ini akan digunakan untuk layanan yang memerlukan kunjungan ke lokasi Anda.</p>
                                </div>
                                
                                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                                    {user.address ? (
                                        (() => {
                                            let addr: any = null;
                                            try {
                                                addr = JSON.parse(user.address);
                                            } catch {
                                                // Not JSON, use as plain string
                                            }
                                            
                                            if (addr && typeof addr === 'object') {
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                        <span style={{ fontSize: '24px' }}>📍</span>
                                                        <div>
                                                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>{user.name}</div>
                                                            <div style={{ color: 'var(--gray-700)', marginBottom: '4px' }}>{addr.street}</div>
                                                            <div style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                                                                {addr.kelurahan && `${addr.kelurahan}, `}
                                                                {addr.kecamatan && `${addr.kecamatan}`}
                                                            </div>
                                                            <div style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                                                                {addr.city && `${addr.city}, `}
                                                                {addr.province} {addr.postalCode && ` ${addr.postalCode}`}
                                                            </div>
                                                            {user.phone && <div style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '8px' }}>📱 {user.phone}</div>}
                                                            {addr.latitude && addr.longitude && (
                                                                <div style={{ marginTop: '12px' }}>
                                                                    <a 
                                                                        href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ color: 'var(--primary-500)', fontSize: '14px' }}
                                                                    >
                                                                        🗺️ Lihat di Google Maps →
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                        <span style={{ fontSize: '24px' }}>📍</span>
                                                        <div>
                                                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{user.name}</div>
                                                            <div style={{ color: 'var(--gray-600)' }}>{user.address}</div>
                                                            {user.phone && <div style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '8px' }}>📱 {user.phone}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                                            <p style={{ color: 'var(--gray-500)' }}>Belum ada alamat tersimpan</p>
                                        </div>
                                    )}
                                </div>
                                
                                <button onClick={() => handleTabChange('profil')} className="btn btn-outline" style={{ width: '100%' }}>
                                    ✏️ {user.address ? 'Ubah Alamat' : 'Tambah Alamat'}
                                </button>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))', borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
                                <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>💡 Tips</h4>
                                <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                                    Pastikan alamat Anda lengkap dengan nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan kota untuk memudahkan tim kami menemukan lokasi Anda.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab: Bantuan & Ketentuan */}
                    {activeTab === 'bantuan' && (
                        <div style={{ maxWidth: '800px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>❓ Bantuan & Ketentuan</h2>
                            
                            {/* Prosedur Reservasi */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📋 Prosedur Reservasi</h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {[
                                        { step: 1, title: 'Pilih Layanan', desc: 'Pilih layanan yang Anda inginkan (Salon, Prasmanan, atau Riasan)' },
                                        { step: 2, title: 'Pilih Paket', desc: 'Pilih paket layanan sesuai kebutuhan dan budget Anda' },
                                        { step: 3, title: 'Tentukan Jadwal', desc: 'Pilih tanggal dan waktu yang Anda inginkan' },
                                        { step: 4, title: 'Konfirmasi', desc: 'Tunggu konfirmasi dari admin (maksimal 1x24 jam)' },
                                        { step: 5, title: 'Layanan Dilaksanakan', desc: 'Tim kami akan hadir sesuai jadwal yang telah dikonfirmasi' },
                                    ].map(item => (
                                        <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                            <div style={{ 
                                                width: '36px', height: '36px', borderRadius: '50%', 
                                                background: 'var(--primary-500)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, flexShrink: 0
                                            }}>{item.step}</div>
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
                                                <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ketentuan */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📜 Syarat & Ketentuan</h3>
                                <div style={{ display: 'grid', gap: '12px', color: 'var(--gray-600)', fontSize: '14px' }}>
                                    <p>• Reservasi dapat dibatalkan maksimal <strong>24 jam</strong> sebelum jadwal yang ditentukan.</p>
                                    <p>• Pembatalan kurang dari 24 jam akan dikenakan biaya pembatalan sebesar <strong>50%</strong> dari total harga.</p>
                                    <p>• Perubahan jadwal dapat dilakukan maksimal <strong>48 jam</strong> sebelum jadwal yang ditentukan.</p>
                                    <p>• Untuk layanan prasmanan, minimal pemesanan adalah sesuai ketentuan paket yang dipilih.</p>
                                    <p>• Pembayaran dilakukan setelah layanan selesai atau sesuai kesepakatan dengan admin.</p>
                                    <p>• Harga dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu.</p>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>🤔 FAQ (Pertanyaan Umum)</h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {[
                                        { q: 'Bagaimana cara membatalkan reservasi?', a: 'Hubungi admin melalui WhatsApp atau batalkan melalui halaman detail reservasi.' },
                                        { q: 'Apakah bisa request layanan di luar paket?', a: 'Ya, silakan diskusikan dengan admin untuk request khusus.' },
                                        { q: 'Berapa lama proses konfirmasi?', a: 'Proses konfirmasi maksimal 1x24 jam di hari kerja.' },
                                        { q: 'Apakah harga sudah termasuk transport?', a: 'Untuk lokasi dalam kota gratis. Lokasi luar kota akan dikenakan biaya tambahan.' },
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>❓ {item.q}</div>
                                            <div style={{ color: 'var(--gray-600)', fontSize: '14px' }}>→ {item.a}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact */}
                            <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))', borderRadius: '16px', padding: '32px', color: 'white', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>📞 Butuh Bantuan?</h3>
                                <p style={{ marginBottom: '20px', opacity: 0.9 }}>Tim customer service kami siap membantu Anda</p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <a href="https://wa.me/6289540129447" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'white', color: 'var(--primary-600)' }}>
                                        💬 WhatsApp
                                    </a>
                                    <a href="mailto:muhammadrizalnurfirdaus@gmail.com" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white' }}>
                                        📧 Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
