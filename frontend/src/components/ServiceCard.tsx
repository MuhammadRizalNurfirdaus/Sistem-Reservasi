import { Link } from 'react-router-dom';
import type { Service } from '../types';

interface ServiceCardProps {
    service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    return (
        <Link to={`/services/${service.id}`} className="service-card">
            <div className="service-image">
                <img
                    src={service.imageUrl || `https://via.placeholder.com/400x200?text=${encodeURIComponent(service.name)}`}
                    alt={service.name}
                />
                <div className="service-icon-badge">
                    {service.icon || '🎯'}
                </div>
            </div>
            <div className="service-body">
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-meta">
                    <span className="service-count">
                        <strong>{service._count?.items || service.items?.length || 0}</strong> layanan tersedia
                    </span>
                    <span className="btn btn-sm btn-primary">Lihat Detail →</span>
                </div>
            </div>
        </Link>
    );
}
