import type { Reservation } from '../types';

interface ReservationCardProps {
    reservation: Reservation;
    onCancel?: (id: string) => void;
}

export default function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': 
                return { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' };
            case 'CONFIRMED': 
                return { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' };
            case 'CANCELLED': 
                return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
            case 'COMPLETED': 
                return { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' };
            default: 
                return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return '⏳ Menunggu Konfirmasi';
            case 'CONFIRMED': return '✅ Dikonfirmasi';
            case 'CANCELLED': return '❌ Dibatalkan';
            case 'COMPLETED': return '🎉 Selesai';
            default: return status;
        }
    };

    const getLocationDisplay = () => {
        if (!reservation.location) return null;
        try {
            const addr = JSON.parse(reservation.location);
            if (addr && typeof addr === 'object') {
                return `${addr.street || ''}, ${addr.kelurahan || ''}, ${addr.city || ''}`;
            }
        } catch {
            return reservation.location;
        }
        return reservation.location;
    };

    const getPaymentMethod = () => {
        if (!reservation.notes) return null;
        const match = reservation.notes.match(/Metode Pembayaran: (.+?)(\n|$)/);
        return match ? match[1] : null;
    };

    const locationDisplay = getLocationDisplay();
    const paymentMethod = getPaymentMethod();
    const statusStyle = getStatusStyle(reservation.status);

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            transition: 'all 0.2s',
            border: '1px solid var(--gray-100)'
        }}>
            {/* Image */}
            <div style={{ width: '160px', flexShrink: 0, position: 'relative' }}>
                <img
                    src={reservation.serviceItem.imageUrl || reservation.serviceItem.service?.imageUrl || 'https://via.placeholder.com/160'}
                    alt={reservation.serviceItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '180px' }}
                />
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '20px'
                }}>
                    {reservation.serviceItem.service?.icon || '📦'}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {reservation.serviceItem.service?.name}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--gray-800)' }}>
                            {reservation.serviceItem.name}
                        </h3>
                    </div>
                    <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        whiteSpace: 'nowrap'
                    }}>
                        {getStatusLabel(reservation.status)}
                    </span>
                </div>
                
                {/* Date, Time, Price */}
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '20px', 
                    fontSize: '14px', 
                    color: 'var(--gray-600)', 
                    marginBottom: '12px',
                    background: 'var(--gray-50)',
                    padding: '12px 16px',
                    borderRadius: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>📅</span>
                        <span>{formatDate(reservation.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>🕐</span>
                        <span>{reservation.time} WIB</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary-600)' }}>
                        <span style={{ fontSize: '16px' }}>💰</span>
                        <span>{formatPrice(reservation.serviceItem.price)}</span>
                    </div>
                </div>

                {/* Location, Phone, Payment */}
                {(locationDisplay || reservation.contactPhone || paymentMethod) && (
                    <div style={{ 
                        display: 'grid',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--gray-500)',
                        marginBottom: '12px'
                    }}>
                        {locationDisplay && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px' }}>📍</span>
                                <span>{locationDisplay}</span>
                            </div>
                        )}
                        {reservation.contactPhone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px' }}>📱</span>
                                <span>{reservation.contactPhone}</span>
                            </div>
                        )}
                        {paymentMethod && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px' }}>💳</span>
                                <span>{paymentMethod}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                {reservation.status === 'PENDING' && onCancel && (
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                        <button
                            onClick={() => onCancel(reservation.id)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #fecaca)';
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.borderColor = '#fca5a5';
                            }}
                        >
                            <span>🚫</span>
                            <span>Batalkan Reservasi</span>
                        </button>
                    </div>
                )}

                {/* Confirmed actions */}
                {reservation.status === 'CONFIRMED' && (
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                            color: '#059669',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 600
                        }}>
                            <span>✅</span>
                            <span>Reservasi sudah dikonfirmasi. Silakan datang sesuai jadwal!</span>
                        </div>
                    </div>
                )}

                {/* Completed actions */}
                {reservation.status === 'COMPLETED' && (
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                            color: '#7c3aed',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 600
                        }}>
                            <span>🎉</span>
                            <span>Terima kasih! Reservasi telah selesai.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
