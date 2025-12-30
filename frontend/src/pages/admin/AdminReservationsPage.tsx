import { useEffect, useState } from 'react';
import { reservationsApi } from '../../services/api';
import type { Reservation } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const data = await reservationsApi.getAll();
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Manajemen Reservasi</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>Pantau dan kelola jadwal reservasi pelanggan</p>

            <div className="card" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={thStyle}>Pelanggan</th>
                            <th style={thStyle}>Layanan</th>
                            <th style={thStyle}>Tanggal & Waktu</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((reservation) => (
                            <tr key={reservation.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600 }}>{reservation.user?.name || 'User'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{reservation.user?.email}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600 }}>{reservation.serviceItem?.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>{reservation.serviceItem?.service?.name}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div>{new Date(reservation.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{reservation.time}</div>
                                </td>
                                <td style={tdStyle}>
                                    <StatusBadge status={reservation.status} />
                                </td>
                                <td style={tdStyle}>
                                    <select
                                        className="form-select"
                                        style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
                                        value={reservation.status}
                                        onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Konfirmasi</option>
                                        <option value="COMPLETED">Selesai</option>
                                        <option value="CANCELLED">Batal</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
