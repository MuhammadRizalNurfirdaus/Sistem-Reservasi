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

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'CONFIRMED': return 'status-confirmed';
            case 'CANCELLED': return 'status-cancelled';
            case 'COMPLETED': return 'status-completed';
            default: return '';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Menunggu Konfirmasi';
            case 'CONFIRMED': return 'Dikonfirmasi';
            case 'CANCELLED': return 'Dibatalkan';
            case 'COMPLETED': return 'Selesai';
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

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            display: 'flex',
            transition: 'box-shadow 0.2s'
        }}>
            <div style={{ width: '140px', flexShrink: 0 }}>
                <img
                    src={reservation.serviceItem.imageUrl || reservation.serviceItem.service?.imageUrl || 'https://via.placeholder.com/140'}
                    alt={reservation.serviceItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '140px' }}
                />
            </div>
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginBottom: '4px' }}>
                                {reservation.serviceItem.service?.icon} {reservation.serviceItem.service?.name}
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{reservation.serviceItem.name}</h3>
                        </div>
                        <span className={`status-badge ${getStatusClass(reservation.status)}`} style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            {getStatusLabel(reservation.status)}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--gray-600)', marginTop: '12px' }}>
                        <div>📅 {formatDate(reservation.date)}</div>
                        <div>🕐 {reservation.time} WIB</div>
                        <div style={{ fontWeight: 600, color: 'var(--primary-600)' }}>💰 {formatPrice(reservation.serviceItem.price)}</div>
                    </div>

                    {(locationDisplay || reservation.contactPhone || paymentMethod) && (
                        <div style={{ 
                            marginTop: '12px', 
                            paddingTop: '12px', 
                            borderTop: '1px solid var(--gray-100)',
                            display: 'grid',
                            gap: '6px',
                            fontSize: '13px',
                            color: 'var(--gray-500)'
                        }}>
                            {locationDisplay && (
                                <div>📍 {locationDisplay}</div>
                            )}
                            {reservation.contactPhone && (
                                <div>📱 {reservation.contactPhone}</div>
                            )}
                            {paymentMethod && (
                                <div>💳 {paymentMethod}</div>
                            )}
                        </div>
                    )}
                </div>

                {reservation.status === 'PENDING' && onCancel && (
                    <div style={{ marginTop: '16px' }}>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => onCancel(reservation.id)}
                            style={{ fontSize: '13px' }}
                        >
                            ❌ Batalkan Reservasi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
