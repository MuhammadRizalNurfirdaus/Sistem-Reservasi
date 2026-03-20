import type { Reservation } from '../types';
import StatusTimeline from './StatusTimeline';

interface ReservationCardProps {
    reservation: Reservation;
    onCancel?: (id: string) => void;
}

export default function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numPrice);
    };

    const getLocationDisplay = () => {
        if (!reservation.location) return null;
        try {
            const addr = JSON.parse(reservation.location);
            if (addr && typeof addr === 'object') return `${addr.street || ''}, ${addr.kelurahan || ''}, ${addr.city || ''}`;
        } catch { return reservation.location; }
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
        <div className="reservation-card" id={`reservation-${reservation.id}`}>
            {/* Image */}
            <div className="reservation-image">
                <img
                    src={reservation.serviceItem.imageUrl || reservation.serviceItem.service?.imageUrl || '/images/salon.png'}
                    alt={reservation.serviceItem.name}
                />
            </div>

            {/* Content */}
            <div className="reservation-content" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                        <div className="reservation-service">{reservation.serviceItem.service?.name}</div>
                        <div className="reservation-item">{reservation.serviceItem.name}</div>
                    </div>
                    <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                        {reservation.status === 'PENDING' && '⏳ Menunggu'}
                        {reservation.status === 'CONFIRMED' && '✅ Dikonfirmasi'}
                        {reservation.status === 'CANCELLED' && '❌ Dibatalkan'}
                        {reservation.status === 'COMPLETED' && '🎉 Selesai'}
                    </span>
                </div>

                {/* Status Timeline */}
                <StatusTimeline currentStatus={reservation.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'} />

                {/* Details */}
                <div className="reservation-details" style={{ background: 'var(--gray-50)', padding: '12px 16px', borderRadius: '10px' }}>
                    <div className="reservation-detail"><span>📅</span> {formatDate(reservation.date)}</div>
                    <div className="reservation-detail"><span>🕐</span> {reservation.time} WIB</div>
                    <div className="reservation-detail" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                        <span>💰</span> {formatPrice(reservation.serviceItem.price)}
                    </div>
                </div>

                {/* Extra info */}
                {(locationDisplay || paymentMethod) && (
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', display: 'grid', gap: '4px', marginTop: '8px' }}>
                        {locationDisplay && <div>📍 {locationDisplay}</div>}
                        {paymentMethod && <div>💳 {paymentMethod}</div>}
                    </div>
                )}

                {/* Actions */}
                <div className="reservation-actions" style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    {reservation.status === 'PENDING' && onCancel && (
                        <button className="btn btn-sm btn-danger" onClick={() => onCancel(reservation.id)}>
                            🚫 Batalkan
                        </button>
                    )}
                    {reservation.status === 'CONFIRMED' && (
                        <div className="alert alert-success" style={{ margin: 0, padding: '10px 16px', fontSize: '13px' }}>
                            ✅ Reservasi dikonfirmasi. Silakan datang sesuai jadwal!
                        </div>
                    )}
                    {reservation.status === 'COMPLETED' && (
                        <div className="alert alert-info" style={{ margin: 0, padding: '10px 16px', fontSize: '13px' }}>
                            🎉 Terima kasih! Reservasi telah selesai.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
