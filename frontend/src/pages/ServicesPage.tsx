import { useEffect, useState } from 'react';
import { servicesApi } from '../services/api';
import type { Service } from '../types';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        servicesApi.getAll()
            .then(setServices)
            .catch(() => setError('Gagal memuat layanan. Silakan coba lagi.'))
            .finally(() => setLoading(false));
    }, []);

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || s.name.toLowerCase().includes(filter.toLowerCase());
        return matchesSearch && matchesFilter;
    });

    const categories = ['all', ...new Set(services.map(s => s.name))];

    if (loading) return <div className="page-wrapper"><LoadingSpinner text="Memuat layanan..." /></div>;

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="dashboard-header">
                <div className="container">
                    <h1 className="dashboard-welcome">Katalog Layanan</h1>
                    <p className="dashboard-subtitle">Pilih kategori layanan yang Anda butuhkan dan temukan paket terbaik</p>
                </div>
            </div>

            <section className="section container" style={{ marginTop: '-20px' }}>
                {/* Search */}
                <div className="search-bar" style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
                    <span className="search-bar-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Cari layanan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-tab ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat === 'all' ? '🏷️ Semua' : cat}
                        </button>
                    ))}
                </div>

                {error ? (
                    <div className="alert alert-error">{error}</div>
                ) : filteredServices.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h2 className="empty-title">Tidak Ditemukan</h2>
                        <p className="empty-description">Tidak ada layanan yang cocok dengan pencarian Anda.</p>
                        <button className="btn btn-primary" onClick={() => { setSearch(''); setFilter('all'); }}>Reset Filter</button>
                    </div>
                ) : (
                    <div className="services-grid">
                        {filteredServices.map((service, index) => (
                            <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <ServiceCard service={service} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
