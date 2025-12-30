import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesApi, reservationsApi } from '../services/api';
import type { ServiceItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ReservationFormPage() {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        guestCount: '',
        notes: '',
        location: '',
        contactPhone: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchItem = async () => {
            if (!itemId) return;
            try {
                const data = await servicesApi.getItem(itemId);
                setItem(data);
            } catch (err) {
                setError('Item layanan tidak ditemukan.');
                console.error('Error fetching item:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId, user, navigate]);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemId) return;

        setSubmitting(true);
        setError(null);

        try {
            await reservationsApi.create({
                serviceItemId: itemId,
                date: formData.date,
                time: formData.time,
                guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
                notes: formData.notes || undefined,
                location: formData.location || undefined,
                contactPhone: formData.contactPhone || undefined
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/my-reservations');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Gagal membuat reservasi. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    // Time slots
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    if (loading) {
        return (
            <div className="page-wrapper">
                <LoadingSpinner text="Memuat form reservasi..." />
            </div>
        );
    }

    if (error && !item) {
        return (
            <div className="page-wrapper">
                <div className="container section">
                    <div className="empty-state">
                        <div className="empty-icon">😕</div>
                        <h2 className="empty-title">{error}</h2>
                        <Link to="/services" className="btn btn-primary">
                            ← Kembali ke Layanan
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="page-wrapper">
                <div className="container section">
                    <div className="empty-state">
                        <div className="empty-icon">🎉</div>
                        <h2 className="empty-title">Reservasi Berhasil!</h2>
                        <p className="empty-description">
                            Terima kasih! Reservasi Anda telah berhasil dibuat. Kami akan menghubungi Anda untuk konfirmasi.
                        </p>
                        <Link to="/my-reservations" className="btn btn-primary">
                            Lihat Reservasi Saya
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <section className="section">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <Link to={`/services/${item?.service?.id || ''}`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--gray-500)',
                        marginBottom: '24px',
                        fontSize: '14px'
                    }}>
                        ← Kembali ke {item?.service?.name || 'Layanan'}
                    </Link>

                    <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
                        <span className="section-badge">Form Reservasi</span>
                        <h1 className="section-title" style={{ fontSize: '32px' }}>Buat Reservasi Baru</h1>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="alert alert-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Tanggal Reservasi *</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={today}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Waktu *</label>
                                <select
                                    name="time"
                                    className="form-select"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Pilih waktu</option>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time} WIB</option>
                                    ))}
                                </select>
                            </div>

                            {item?.service?.name === 'Prasmanan' && (
                                <div className="form-group">
                                    <label className="form-label">Jumlah Tamu</label>
                                    <input
                                        type="number"
                                        name="guestCount"
                                        className="form-input"
                                        value={formData.guestCount}
                                        onChange={handleChange}
                                        placeholder="Contoh: 100"
                                        min="1"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Lokasi / Alamat Lengkap *</label>
                                <textarea
                                    name="location"
                                    className="form-textarea"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Alamat lengkap lokasi untuk makeup/prasmanan..."
                                    required
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nomor WhatsApp / HP Aktif *</label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    className="form-input"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    placeholder="Contoh: 081234567890"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Catatan Tambahan</label>
                                <textarea
                                    name="notes"
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Tulis catatan atau permintaan khusus di sini..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                                disabled={submitting}
                            >
                                {submitting ? 'Memproses...' : 'Konfirmasi Reservasi'}
                            </button>
                        </form>

                        {/* Summary Card */}
                        <div>
                            <div style={{
                                background: 'white',
                                borderRadius: 'var(--radius-lg)',
                                padding: '24px',
                                boxShadow: 'var(--shadow-md)',
                                border: '1px solid var(--gray-100)',
                                position: 'sticky',
                                top: '100px'
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-800)' }}>
                                    Ringkasan Pesanan
                                </h3>

                                {item && (
                                    <>
                                        <img
                                            src={item.imageUrl || item.service?.imageUrl || 'https://via.placeholder.com/300x150'}
                                            alt={item.name}
                                            style={{
                                                width: '100%',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius-md)',
                                                marginBottom: '16px'
                                            }}
                                        />
                                        <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                                            {item.service?.icon} {item.service?.name}
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '8px' }}>
                                            {item.name}
                                        </h4>
                                        <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
                                            {item.description}
                                        </p>

                                        <div style={{
                                            borderTop: '1px solid var(--gray-100)',
                                            paddingTop: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Total</span>
                                            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-600)' }}>
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        {item.duration && (
                                            <div style={{
                                                marginTop: '12px',
                                                fontSize: '13px',
                                                color: 'var(--gray-500)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                ⏱️ Durasi: {item.duration} menit
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
