import { Link } from 'react-router-dom';
import type { Service } from '../types';

interface ServiceCardProps {
    service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    const itemCount = service._count?.items || service.items?.length || 0;
    const minPrice = service.items?.length
        ? Math.min(...service.items.map(i => typeof i.price === 'string' ? parseFloat(i.price) : i.price))
        : 0;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <Link to={`/services/${service.id}`} className="service-card" id={`service-${service.id}`}>
            <div className="service-image">
                <img
                    src={service.imageUrl || `/images/salon.png`}
                    alt={service.name}
                    loading="lazy"
                />
                <div className="service-image-overlay" />
                <div className="service-icon-badge">
                    {service.icon || '🎯'}
                </div>
            </div>
            <div className="service-body">
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">
                    {service.description || 'Layanan profesional berkualitas tinggi untuk kebutuhan Anda.'}
                </p>
                <div className="service-meta">
                    <div>
                        <span className="service-count"><strong>{itemCount}</strong> layanan tersedia</span>
                        {minPrice > 0 && (
                            <div style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 700, marginTop: '4px' }}>
                                Mulai {formatPrice(minPrice)}
                            </div>
                        )}
                    </div>
                    <span className="btn btn-sm btn-primary">Lihat Detail →</span>
                </div>
            </div>
        </Link>
    );
}
