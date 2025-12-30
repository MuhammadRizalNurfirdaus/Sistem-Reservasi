import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { servicesApi } from '../services/api';
import type { Service } from '../types';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LandingPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await servicesApi.getAll();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            ⭐ Platform Reservasi Terpercaya #1
                        </div>
                        <h1 className="hero-title">
                            Booking Mudah untuk
                            <span>Salon, Prasmanan & Riasan</span>
                        </h1>
                        <p className="hero-subtitle">
                            Nikmati kemudahan reservasi layanan kecantikan dan catering dalam satu platform.
                            Proses cepat, layanan prima, harga transparan.
                        </p>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/services" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-600)' }}>
                                    Lihat Layanan →
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-600)' }}>
                                        Mulai Sekarang →
                                    </Link>
                                    <Link to="/services" className="btn btn-lg btn-outline">
                                        Lihat Layanan
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-cards">
                            <div className="hero-card animate-fade-in stagger-1">
                                <div className="hero-card-icon">💇</div>
                                <div className="hero-card-title">Salon</div>
                                <div className="hero-card-desc">Perawatan rambut profesional</div>
                            </div>
                            <div className="hero-card animate-fade-in stagger-2">
                                <div className="hero-card-icon">🍽️</div>
                                <div className="hero-card-title">Prasmanan</div>
                                <div className="hero-card-desc">Catering untuk segala acara</div>
                            </div>
                            <div className="hero-card animate-fade-in stagger-3">
                                <div className="hero-card-icon">💄</div>
                                <div className="hero-card-title">Riasan</div>
                                <div className="hero-card-desc">Makeup profesional</div>
                            </div>
                            <div className="hero-card animate-fade-in stagger-4">
                                <div className="hero-card-icon">✨</div>
                                <div className="hero-card-title">Premium</div>
                                <div className="hero-card-desc">Layanan terbaik untuk Anda</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="section" style={{ background: 'white' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Layanan Kami</span>
                        <h2 className="section-title">Pilih Layanan Sesuai Kebutuhan</h2>
                        <p className="section-subtitle">
                            Kami menyediakan berbagai layanan berkualitas tinggi untuk memenuhi kebutuhan Anda
                        </p>
                    </div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <div className="services-grid">
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Mengapa Kami</span>
                        <h2 className="section-title">Keunggulan Platform Kami</h2>
                    </div>

                    <div className="services-grid">
                        <div className="service-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                            <h3 className="service-name">Proses Cepat</h3>
                            <p className="service-description">
                                Booking hanya dalam hitungan menit. Tanpa ribet, tanpa antri.
                            </p>
                        </div>
                        <div className="service-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💯</div>
                            <h3 className="service-name">Layanan Terpercaya</h3>
                            <p className="service-description">
                                Semua vendor telah terverifikasi dan memiliki rating tinggi.
                            </p>
                        </div>
                        <div className="service-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                            <h3 className="service-name">Harga Transparan</h3>
                            <p className="service-description">
                                Tidak ada biaya tersembunyi. Apa yang Anda lihat adalah apa yang Anda bayar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ background: 'var(--gradient-primary)', padding: '80px 0' }}>
                <div className="container" style={{ textAlign: 'center', color: 'white' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>
                        Siap untuk Memulai?
                    </h2>
                    <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                        Bergabunglah dengan ribuan pelanggan yang telah mempercayai layanan kami
                    </p>
                    {user ? (
                        <Link to="/services" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-600)' }}>
                            Booking Sekarang →
                        </Link>
                    ) : (
                        <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-600)' }}>
                            Daftar Gratis →
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
