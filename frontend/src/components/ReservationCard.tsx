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
            case 'PENDING': return 'Menunggu';
            case 'CONFIRMED': return 'Dikonfirmasi';
            case 'CANCELLED': return 'Dibatalkan';
            case 'COMPLETED': return 'Selesai';
            default: return status;
        }
    };

    return (
        <div className="reservation-card">
            <div className="reservation-image">
                <img
                    src={reservation.serviceItem.imageUrl || reservation.serviceItem.service?.imageUrl || 'https://via.placeholder.com/100'}
                    alt={reservation.serviceItem.name}
                />
            </div>
            <div className="reservation-content">
                <div className="reservation-service">
                    {reservation.serviceItem.service?.icon} {reservation.serviceItem.service?.name}
                </div>
                <h3 className="reservation-item">{reservation.serviceItem.name}</h3>
                <div className="reservation-details">
                    <div className="reservation-detail">
                        📅 {formatDate(reservation.date)}
                    </div>
                    <div className="reservation-detail">
                        🕐 {reservation.time}
                    </div>
                    <div className="reservation-detail">
                        💰 {formatPrice(reservation.serviceItem.price)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                    </span>
                    {reservation.status === 'PENDING' && onCancel && (
                        <div className="reservation-actions">
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => onCancel(reservation.id)}
                            >
                                Batalkan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
