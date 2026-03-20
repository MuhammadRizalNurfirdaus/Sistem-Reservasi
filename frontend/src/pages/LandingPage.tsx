import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { servicesApi } from '../services/api';
import type { Service } from '../types';
import ServiceCard from '../components/ServiceCard';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';

function useCountUp(target: number, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                let start = 0;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(timer); }
                    else setCount(Math.floor(start));
                }, 16);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

const testimonials = [
    { name: 'Siti Nurhaliza', role: 'Pengantin', text: 'Layanan riasan yang luar biasa! Tim sangat profesional dan result-nya memuaskan. Sangat direkomendasikan!', stars: 5 },
    { name: 'Ahmad Fadillah', role: 'Event Organizer', text: 'Prasmanan untuk acara kami sangat enak dan presentasinya mewah. Tamu-tamu kami sangat puas.', stars: 5 },
    { name: 'Dewi Lestari', role: 'Pelanggan Setia', text: 'Sudah 2 tahun berlangganan layanan salon. Hasilnya selalu memuaskan dan booking sangat mudah.', stars: 5 },
];

const galleryImages = [
    { src: '/images/booking.png', alt: 'Sistem Booking Online', caption: 'Booking Online Mudah & Cepat' },
    { src: '/images/salon.png', alt: 'Salon Reservasi', caption: 'Resepsi Salon Modern' },
    { src: '/images/catering.png', alt: 'Catering Prasmanan', caption: 'Setup Catering Premium' },
    { src: '/images/makeup.png', alt: 'Riasan Profesional', caption: 'Bridal Makeup Profesional' },
    { src: '/images/salon.png', alt: 'Booking Appointment', caption: 'Appointment Checking' },
    { src: '/images/catering.png', alt: 'Buffet Setup', caption: 'Prasmanan Mewah' },
];

export default function LandingPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const stat1 = useCountUp(2500);
    const stat2 = useCountUp(150);
    const stat3 = useCountUp(98);

    useEffect(() => {
        servicesApi.getAll().then(setServices).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* ===== Hero Section ===== */}
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">⭐ Platform Reservasi Terpercaya #1</div>
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
                                <Link to="/services" className="btn btn-lg btn-primary">Lihat Layanan →</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-lg btn-primary">Mulai Sekarang →</Link>
                                    <Link to="/services" className="btn btn-lg btn-outline">Lihat Layanan</Link>
                                </>
                            )}
                        </div>

                        <div className="hero-stats">
                            <div ref={stat1.ref}>
                                <div className="hero-stat-value">{stat1.count.toLocaleString()}+</div>
                                <div className="hero-stat-label">Pelanggan Puas</div>
                            </div>
                            <div ref={stat2.ref}>
                                <div className="hero-stat-value">{stat2.count}+</div>
                                <div className="hero-stat-label">Layanan Tersedia</div>
                            </div>
                            <div ref={stat3.ref}>
                                <div className="hero-stat-value">{stat3.count}%</div>
                                <div className="hero-stat-label">Kepuasan</div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-cards">
                            <div className="hero-card stagger-1">
                                <div className="hero-card-icon">💇</div>
                                <div className="hero-card-title">Salon</div>
                                <div className="hero-card-desc">Perawatan rambut profesional</div>
                            </div>
                            <div className="hero-card stagger-2">
                                <div className="hero-card-icon">🍽️</div>
                                <div className="hero-card-title">Prasmanan</div>
                                <div className="hero-card-desc">Catering untuk segala acara</div>
                            </div>
                            <div className="hero-card stagger-3">
                                <div className="hero-card-icon">💄</div>
                                <div className="hero-card-title">Riasan</div>
                                <div className="hero-card-desc">Makeup profesional</div>
                            </div>
                            <div className="hero-card stagger-4">
                                <div className="hero-card-icon">✨</div>
                                <div className="hero-card-title">Premium</div>
                                <div className="hero-card-desc">Layanan terbaik untuk Anda</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Services Section ===== */}
            <section className="section" style={{ background: 'white' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Layanan Kami</span>
                        <h2 className="section-title">Pilih Layanan Sesuai Kebutuhan</h2>
                        <p className="section-subtitle">
                            Kami menyediakan berbagai layanan berkualitas tinggi untuk memenuhi kebutuhan Anda
                        </p>
                    </div>
                    {loading ? <LoadingSpinner /> : (
                        <div className="services-grid">
                            {services.map((service, i) => (
                                <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <ServiceCard service={service} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== Features Section ===== */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Mengapa Kami</span>
                        <h2 className="section-title">Keunggulan Platform Kami</h2>
                    </div>
                    <div className="services-grid">
                        {[
                            { icon: '🚀', title: 'Proses Cepat', desc: 'Booking hanya dalam hitungan menit. Tanpa ribet, tanpa antri.' },
                            { icon: '💯', title: 'Layanan Terpercaya', desc: 'Semua vendor telah terverifikasi dan memiliki rating tinggi.' },
                            { icon: '💰', title: 'Harga Transparan', desc: 'Tidak ada biaya tersembunyi. Apa yang Anda lihat adalah apa yang Anda bayar.' },
                        ].map((f, i) => (
                            <div key={i} className="service-card animate-fade-in" style={{ textAlign: 'center', padding: '48px 28px', animationDelay: `${i * 0.15}s` }}>
                                <div style={{ fontSize: '52px', marginBottom: '20px' }}>{f.icon}</div>
                                <h3 className="service-name">{f.title}</h3>
                                <p className="service-description">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Video Section ===== */}
            <section className="video-section">
                <div className="container">
                    <div className="section-header" style={{ color: 'white' }}>
                        <span className="section-badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                            Video
                        </span>
                        <h2 className="section-title" style={{ color: 'white' }}>Lihat Layanan Kami Beraksi</h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Saksikan kualitas layanan kami melalui video di bawah ini
                        </p>
                    </div>
                    <div className="video-container">
                        <iframe
                        src="https://www.youtube.com/embed/QVINhpP9060?controls=1&rel=0"
                            title="Layanan Kami"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>

            {/* ===== Gallery Section ===== */}
            <section className="section" style={{ background: 'white' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Galeri</span>
                        <h2 className="section-title">Portfolio Layanan Kami</h2>
                        <p className="section-subtitle">
                            Lihat hasil karya dan suasana layanan kami yang telah dipercaya oleh ribuan pelanggan
                        </p>
                    </div>
                    <ImageGallery images={galleryImages} columns={3} />
                </div>
            </section>

            {/* ===== Testimonials ===== */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Testimoni</span>
                        <h2 className="section-title">Apa Kata Pelanggan Kami</h2>
                    </div>
                    <div className="testimonial-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-author">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=6366f1&color=fff&bold=true&size=44`}
                                        alt={t.name}
                                        className="testimonial-avatar"
                                    />
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA Section ===== */}
            <section style={{ background: 'var(--gradient-primary)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="container" style={{ textAlign: 'center', color: 'white', position: 'relative' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.5px' }}>
                        Siap untuk Memulai?
                    </h2>
                    <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
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
