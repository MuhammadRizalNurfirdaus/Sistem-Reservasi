import { useEffect, useState } from 'react';
import { servicesApi } from '../services/api';
import type { Service } from '../types';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await servicesApi.getAll();
                setServices(data);
            } catch (err) {
                setError('Gagal memuat layanan. Silakan coba lagi.');
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) {
        return (
            <div className="page-wrapper">
                <LoadingSpinner text="Memuat layanan..." />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Katalog Layanan</span>
                        <h1 className="section-title">Semua Layanan Kami</h1>
                        <p className="section-subtitle">
                            Pilih kategori layanan yang Anda butuhkan dan temukan paket terbaik untuk Anda
                        </p>
                    </div>

                    {error ? (
                        <div className="alert alert-error">{error}</div>
                    ) : (
                        <div className="services-grid">
                            {services.map((service, index) => (
                                <div key={service.id} className={`animate-fade-in stagger-${index + 1}`}>
                                    <ServiceCard service={service} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
