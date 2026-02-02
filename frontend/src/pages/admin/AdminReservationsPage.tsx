import { useEffect, useState } from 'react';
import { reservationsApi } from '../../services/api';
import type { Reservation } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const data = await reservationsApi.getAllAdmin();
            setReservations(data);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await reservationsApi.update(id, { status: newStatus });
            setReservations(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus as any } : r
            ));
        } catch (error) {
            alert('Gagal mengupdate status');
        }
    };

    const handlePaymentChange = async (id: string, isPaid: boolean) => {
        try {
            await reservationsApi.update(id, { isPaid } as any);
            setReservations(prev => prev.map(r =>
                r.id === id ? { ...r, isPaid } : r
            ));
        } catch (error) {
            alert('Gagal mengupdate status pembayaran');
        }
    };

    const filteredReservations = filterStatus === 'ALL' 
        ? reservations 
        : reservations.filter(r => r.status === filterStatus);

    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'PENDING').length,
        confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
        completed: reservations.filter(r => r.status === 'COMPLETED').length,
        cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
        totalRevenue: reservations.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + (Number(r.serviceItem?.price) || 0), 0)
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Manajemen Reservasi</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Pantau dan kelola jadwal reservasi pelanggan</p>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gray-800)' }}>{stats.total}</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total Reservasi</div>
                </div>
                <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#c2410c' }}>{stats.pending}</div>
                    <div style={{ fontSize: '13px', color: '#c2410c' }}>Menunggu</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#1d4ed8' }}>{stats.confirmed}</div>
                    <div style={{ fontSize: '13px', color: '#1d4ed8' }}>Dikonfirmasi</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#15803d' }}>{stats.completed}</div>
                    <div style={{ fontSize: '13px', color: '#15803d' }}>Selesai</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))', padding: '20px', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatPrice(stats.totalRevenue)}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Pendapatan</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[
                    { value: 'ALL', label: 'Semua', count: stats.total },
                    { value: 'PENDING', label: '⏳ Menunggu', count: stats.pending },
                    { value: 'CONFIRMED', label: '✅ Dikonfirmasi', count: stats.confirmed },
                    { value: 'COMPLETED', label: '🎉 Selesai', count: stats.completed },
                    { value: 'CANCELLED', label: '❌ Dibatalkan', count: stats.cancelled }
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilterStatus(tab.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: filterStatus === tab.value ? 'none' : '1px solid var(--gray-200)',
                            background: filterStatus === tab.value ? 'var(--primary-600)' : 'white',
                            color: filterStatus === tab.value ? 'white' : 'var(--gray-600)',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {tab.label}
                        <span style={{
                            background: filterStatus === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px'
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                {filteredReservations.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>Tidak ada reservasi</div>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                            <tr>
                                <th style={thStyle}>Pelanggan</th>
                                <th style={thStyle}>Layanan</th>
                                <th style={thStyle}>Jadwal</th>
                                <th style={thStyle}>Harga</th>
                                <th style={thStyle}>Lokasi</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservations.map((reservation) => (
                                <tr 
                                    key={reservation.id} 
                                    style={{ 
                                        borderBottom: '1px solid var(--gray-100)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'var(--primary-100)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                color: 'var(--primary-600)',
                                                overflow: 'hidden'
                                            }}>
                                                {reservation.user?.avatar ? (
                                                    <img src={getImageUrl(reservation.user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    (reservation.user?.name || 'U').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{reservation.user?.name || 'User'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{reservation.user?.email}</div>
                                                {reservation.contactPhone && (
                                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>📞 {reservation.contactPhone}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '8px',
                                                background: 'var(--gray-100)',
                                                overflow: 'hidden'
                                            }}>
                                                {reservation.serviceItem?.imageUrl ? (
                                                    <img src={getImageUrl(reservation.serviceItem.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '20px' }}>
                                                        {reservation.serviceItem?.service?.icon || '📦'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{reservation.serviceItem?.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>{reservation.serviceItem?.service?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                                            {new Date(reservation.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>🕐 {reservation.time} WIB</div>
                                        {reservation.guestCount && (
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>👥 {reservation.guestCount} orang</div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '15px' }}>
                                            {formatPrice(Number(reservation.serviceItem?.price) || 0)}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', maxWidth: '180px' }}>
                                            {reservation.location ? (
                                                <>
                                                    <span>📍</span> {reservation.location.length > 40 ? reservation.location.substring(0, 40) + '...' : reservation.location}
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--gray-400)' }}>-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <StatusBadge status={reservation.status} />
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <select
                                                className="form-select"
                                                style={{ 
                                                    padding: '8px 12px', 
                                                    fontSize: '13px', 
                                                    width: 'auto',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--gray-200)'
                                                }}
                                                value={reservation.status}
                                                onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                                            >
                                                <option value="PENDING">⏳ Pending</option>
                                                <option value="CONFIRMED">✅ Konfirmasi</option>
                                                <option value="COMPLETED">🎉 Selesai</option>
                                                <option value="CANCELLED">❌ Batal</option>
                                            </select>
                                            <button
                                                onClick={() => setSelectedReservation(reservation)}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'var(--gray-100)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                                title="Lihat Detail"
                                            >
                                                👁️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selectedReservation && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        width: '600px',
                        maxWidth: '100%',
                        maxHeight: '85vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--gray-100)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            background: 'white'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>📋 Detail Reservasi</h2>
                            <button
                                onClick={() => setSelectedReservation(null)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--gray-400)' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {/* Transaction ID & Status */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '24px',
                                padding: '16px',
                                background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))',
                                borderRadius: '12px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>ID Transaksi</div>
                                    <div style={{ fontWeight: 700, color: 'var(--gray-800)', fontFamily: 'monospace' }}>
                                        #{selectedReservation.id.slice(-8).toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Dibuat pada</div>
                                    <div style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '13px' }}>
                                        {new Date(selectedReservation.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>👤 PELANGGAN</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        color: 'var(--primary-600)',
                                        overflow: 'hidden'
                                    }}>
                                        {selectedReservation.user?.avatar ? (
                                            <img src={getImageUrl(selectedReservation.user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            (selectedReservation.user?.name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)' }}>{selectedReservation.user?.name}</div>
                                        <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>📧 {selectedReservation.user?.email}</div>
                                        {selectedReservation.contactPhone && (
                                            <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>📞 {selectedReservation.contactPhone}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>🛍️ LAYANAN DIPESAN</h3>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '16px', 
                                    padding: '16px', 
                                    background: 'var(--gray-50)', 
                                    borderRadius: '12px' 
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '12px',
                                        background: 'var(--gray-200)',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        {selectedReservation.serviceItem?.imageUrl ? (
                                            <img src={getImageUrl(selectedReservation.serviceItem.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>
                                                {selectedReservation.serviceItem?.service?.icon || '📦'}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginBottom: '4px' }}>
                                            {selectedReservation.serviceItem?.service?.icon} {selectedReservation.serviceItem?.service?.name}
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '4px' }}>
                                            {selectedReservation.serviceItem?.name}
                                        </div>
                                        {selectedReservation.serviceItem?.duration && (
                                            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>
                                                ⏱️ Durasi: {selectedReservation.serviceItem.duration} menit
                                            </div>
                                        )}
                                        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success)' }}>
                                            {formatPrice(Number(selectedReservation.serviceItem?.price) || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule & Details */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>📅 JADWAL</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Tanggal</div>
                                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>
                                            {new Date(selectedReservation.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Waktu</div>
                                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{selectedReservation.time} WIB</div>
                                    </div>
                                    {selectedReservation.guestCount && (
                                        <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Jumlah Tamu</div>
                                            <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{selectedReservation.guestCount} orang</div>
                                        </div>
                                    )}
                                    <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Status Reservasi</div>
                                        <StatusBadge status={selectedReservation.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>📍 LOKASI</h3>
                                <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px', color: 'var(--gray-700)' }}>
                                    {selectedReservation.location || <span style={{ color: 'var(--gray-400)' }}>Lokasi belum ditentukan</span>}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>💳 PEMBAYARAN</h3>
                                <div style={{ 
                                    padding: '20px', 
                                    background: selectedReservation.isPaid ? '#f0fdf4' : '#fff7ed', 
                                    borderRadius: '12px',
                                    border: `1px solid ${selectedReservation.isPaid ? '#bbf7d0' : '#fed7aa'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Metode Pembayaran</div>
                                            <div style={{ fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {selectedReservation.paymentMethod === 'COD' && '💵 Bayar di Tempat (COD)'}
                                                {selectedReservation.paymentMethod === 'TRANSFER' && '🏦 Transfer Bank'}
                                                {selectedReservation.paymentMethod === 'EWALLET' && '📱 E-Wallet'}
                                                {!selectedReservation.paymentMethod && '💵 Bayar di Tempat (COD)'}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            background: selectedReservation.isPaid ? '#15803d' : '#c2410c',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '13px'
                                        }}>
                                            {selectedReservation.isPaid ? '✅ Sudah Dibayar' : '⏳ Belum Dibayar'}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        paddingTop: '16px',
                                        borderTop: '1px dashed var(--gray-300)'
                                    }}>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-600)' }}>Total Pembayaran</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-800)' }}>
                                            {formatPrice(Number(selectedReservation.serviceItem?.price) || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedReservation.notes && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>📝 CATATAN PELANGGAN</h3>
                                    <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px', color: 'var(--gray-700)', border: '1px solid #fcd34d' }}>
                                        {selectedReservation.notes}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setSelectedReservation(null)}
                                    className="btn btn-outline"
                                    style={{ flex: 1, minWidth: '120px' }}
                                >
                                    Tutup
                                </button>
                                
                                {!selectedReservation.isPaid && selectedReservation.status !== 'CANCELLED' && (
                                    <button
                                        onClick={() => {
                                            handlePaymentChange(selectedReservation.id, true);
                                            setSelectedReservation({ ...selectedReservation, isPaid: true });
                                        }}
                                        style={{ 
                                            flex: 1, 
                                            minWidth: '120px',
                                            padding: '12px 20px',
                                            background: 'var(--success)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        💰 Tandai Sudah Dibayar
                                    </button>
                                )}
                                
                                {selectedReservation.status === 'PENDING' && (
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedReservation.id, 'CONFIRMED');
                                            setSelectedReservation({ ...selectedReservation, status: 'CONFIRMED' });
                                        }}
                                        className="btn btn-primary"
                                        style={{ flex: 1, minWidth: '120px' }}
                                    >
                                        ✅ Konfirmasi
                                    </button>
                                )}
                                
                                {selectedReservation.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedReservation.id, 'COMPLETED');
                                            setSelectedReservation({ ...selectedReservation, status: 'COMPLETED' });
                                        }}
                                        style={{ 
                                            flex: 1, 
                                            minWidth: '120px',
                                            padding: '12px 20px',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🎉 Selesai
                                    </button>
                                )}
                                
                                {selectedReservation.status !== 'CANCELLED' && selectedReservation.status !== 'COMPLETED' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Yakin ingin membatalkan reservasi ini?')) {
                                                handleStatusChange(selectedReservation.id, 'CANCELLED');
                                                setSelectedReservation({ ...selectedReservation, status: 'CANCELLED' });
                                            }
                                        }}
                                        style={{ 
                                            padding: '12px 20px',
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ❌ Batalkan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        PENDING: { bg: '#fff7ed', color: '#c2410c' },
        CONFIRMED: { bg: '#eff6ff', color: '#1d4ed8' },
        COMPLETED: { bg: '#f0fdf4', color: '#15803d' },
        CANCELLED: { bg: '#fef2f2', color: '#b91c1c' },
    };
    const style = styles[status] || styles.PENDING;

    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            background: style.bg,
            color: style.color,
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase'
        }}>
            {status}
        </span>
    );
}

const thStyle = {
    padding: '16px 24px',
    textAlign: 'left' as const,
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--gray-500)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

const tdStyle = {
    padding: '16px 24px',
    fontSize: '14px',
    color: 'var(--gray-700)',
};
