import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesApi, reservationsApi } from '../services/api';
import type { ServiceItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// API Wilayah Indonesia
const WILAYAH_API = 'https://www.emsifa.com/api-wilayah-indonesia/api';

interface Region {
    id: string;
    name: string;
}

const paymentMethods = [
    { id: 'cod', name: 'Bayar di Tempat (COD)', desc: 'Pembayaran saat layanan dilakukan', icon: '💵' },
    { id: 'bca', name: 'Transfer Bank BCA', desc: 'No. Rek: 5270424224', icon: '🏦' },
    { id: 'bni', name: 'Transfer Bank BNI', desc: 'No. Rek: 1234567890', icon: '🏦' },
    { id: 'bri', name: 'Transfer Bank BRI', desc: 'No. Rek: 032101003456789', icon: '🏦' },
    { id: 'mandiri', name: 'Transfer Bank Mandiri', desc: 'No. Rek: 1370012345678', icon: '🏦' },
];

export default function ReservationFormPage() {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Wilayah states
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [cities, setCities] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [villages, setVillages] = useState<Region[]>([]);
    const [loadingWilayah, setLoadingWilayah] = useState({
        provinces: false,
        cities: false,
        districts: false,
        villages: false
    });

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        guestCount: '',
        notes: '',
        addressStreet: '',
        provinceId: '',
        provinceName: '',
        cityId: '',
        cityName: '',
        kecamatanId: '',
        kecamatanName: '',
        kelurahanId: '',
        kelurahanName: '',
        postalCode: '',
        contactPhone: '',
        latitude: '',
        longitude: '',
        paymentMethod: 'cod'
    });

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingWilayah(prev => ({ ...prev, provinces: true }));
            try {
                const response = await fetch(`${WILAYAH_API}/provinces.json`);
                const data = await response.json();
                setProvinces(data);
            } catch (err) {
                console.error('Error fetching provinces:', err);
            } finally {
                setLoadingWilayah(prev => ({ ...prev, provinces: false }));
            }
        };
        fetchProvinces();
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (!formData.provinceId) {
            setCities([]);
            setDistricts([]);
            setVillages([]);
            return;
        }
        
        const fetchCities = async () => {
            setLoadingWilayah(prev => ({ ...prev, cities: true }));
            try {
                const response = await fetch(`${WILAYAH_API}/regencies/${formData.provinceId}.json`);
                const data = await response.json();
                setCities(data);
            } catch (err) {
                console.error('Error fetching cities:', err);
            } finally {
                setLoadingWilayah(prev => ({ ...prev, cities: false }));
            }
        };
        fetchCities();
    }, [formData.provinceId]);

    // Fetch districts when city changes
    useEffect(() => {
        if (!formData.cityId) {
            setDistricts([]);
            setVillages([]);
            return;
        }
        
        const fetchDistricts = async () => {
            setLoadingWilayah(prev => ({ ...prev, districts: true }));
            try {
                const response = await fetch(`${WILAYAH_API}/districts/${formData.cityId}.json`);
                const data = await response.json();
                setDistricts(data);
            } catch (err) {
                console.error('Error fetching districts:', err);
            } finally {
                setLoadingWilayah(prev => ({ ...prev, districts: false }));
            }
        };
        fetchDistricts();
    }, [formData.cityId]);

    // Fetch villages when district changes
    useEffect(() => {
        if (!formData.kecamatanId) {
            setVillages([]);
            return;
        }
        
        const fetchVillages = async () => {
            setLoadingWilayah(prev => ({ ...prev, villages: true }));
            try {
                const response = await fetch(`${WILAYAH_API}/villages/${formData.kecamatanId}.json`);
                const data = await response.json();
                setVillages(data);
            } catch (err) {
                console.error('Error fetching villages:', err);
            } finally {
                setLoadingWilayah(prev => ({ ...prev, villages: false }));
            }
        };
        fetchVillages();
    }, [formData.kecamatanId]);

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

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                contactPhone: user.phone || ''
            }));
        }
    }, [user]);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('Browser Anda tidak mendukung geolocation');
            return;
        }
        
        setLocationLoading(true);
        setLocationStatus('idle');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6)
                }));
                
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`
                    );
                    const data = await response.json();
                    
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev,
                            addressStreet: data.address.road || data.address.pedestrian || prev.addressStreet,
                            postalCode: data.address.postcode || prev.postalCode,
                        }));
                    }
                } catch {
                    // Ignore reverse geocoding errors
                }
                
                setLocationStatus('success');
                setLocationLoading(false);
            },
            () => {
                setLocationStatus('error');
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemId) return;

        const fullAddress = JSON.stringify({
            street: formData.addressStreet,
            province: formData.provinceName,
            city: formData.cityName,
            kecamatan: formData.kecamatanName,
            kelurahan: formData.kelurahanName,
            postalCode: formData.postalCode,
            latitude: formData.latitude,
            longitude: formData.longitude
        });

        setSubmitting(true);
        setError(null);

        try {
            const paymentMethodMap: Record<string, 'COD' | 'TRANSFER' | 'EWALLET'> = {
                'cod': 'COD',
                'transfer': 'TRANSFER',
                'ewallet': 'EWALLET'
            };
            
            await reservationsApi.create({
                serviceItemId: itemId,
                date: formData.date,
                time: formData.time,
                guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
                notes: formData.notes || undefined,
                location: fullAddress,
                contactPhone: formData.contactPhone || undefined,
                paymentMethod: paymentMethodMap[formData.paymentMethod] || 'COD'
            });
            setSuccess(true);
            setShowModal(false);
        } catch (err: any) {
            setError(err.message || 'Gagal membuat reservasi. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedProvince = provinces.find(p => p.id === selectedId);
        setFormData(prev => ({
            ...prev,
            provinceId: selectedId,
            provinceName: selectedProvince?.name || '',
            cityId: '',
            cityName: '',
            kecamatanId: '',
            kecamatanName: '',
            kelurahanId: '',
            kelurahanName: ''
        }));
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedCity = cities.find(c => c.id === selectedId);
        setFormData(prev => ({
            ...prev,
            cityId: selectedId,
            cityName: selectedCity?.name || '',
            kecamatanId: '',
            kecamatanName: '',
            kelurahanId: '',
            kelurahanName: ''
        }));
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedDistrict = districts.find(d => d.id === selectedId);
        setFormData(prev => ({
            ...prev,
            kecamatanId: selectedId,
            kecamatanName: selectedDistrict?.name || '',
            kelurahanId: '',
            kelurahanName: ''
        }));
    };

    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedVillage = villages.find(v => v.id === selectedId);
        setFormData(prev => ({
            ...prev,
            kelurahanId: selectedId,
            kelurahanName: selectedVillage?.name || ''
        }));
    };

    const openConfirmModal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.time || !formData.addressStreet || !formData.provinceId || 
            !formData.cityId || !formData.kecamatanId || !formData.kelurahanId || !formData.contactPhone) {
            setError('Mohon lengkapi semua field yang wajib diisi');
            return;
        }
        setError(null);
        setShowModal(true);
    };

    const today = new Date().toISOString().split('T')[0];

    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: '#ccc',
        marginBottom: '8px',
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                </div>
                <Footer />
            </div>
        );
    }

    if (error && !item) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                        <h2>{error}</h2>
                        <Link to="/services" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            ← Kembali ke Layanan
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>Reservasi Berhasil!</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '32px', lineHeight: 1.6 }}>
                            Terima kasih! Reservasi Anda telah berhasil dibuat. Tim kami akan segera menghubungi Anda untuk konfirmasi melalui WhatsApp.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <Link to="/dashboard?tab=reservasi" className="btn btn-primary">
                                Lihat Reservasi Saya
                            </Link>
                            <Link to="/services" className="btn btn-outline">
                                Kembali ke Layanan
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {item && (
                <div style={{ 
                    background: `linear-gradient(135deg, var(--primary-600), var(--primary-800))`,
                    padding: '40px 0',
                    color: 'white'
                }}>
                    <div className="container">
                        <Link to={`/services/${item.service?.id || ''}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'rgba(255,255,255,0.8)',
                            marginBottom: '20px',
                            fontSize: '14px',
                            textDecoration: 'none'
                        }}>
                            ← Kembali ke {item.service?.name || 'Layanan'}
                        </Link>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ 
                                width: '100px', height: '100px', 
                                borderRadius: '16px', 
                                background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '48px'
                            }}>
                                {item.service?.icon || '📦'}
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
                                    {item.service?.name}
                                </div>
                                <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
                                    {item.name}
                                </h1>
                                <p style={{ opacity: 0.9, marginTop: '8px' }}>{item.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main style={{ flex: 1, padding: '40px 0', background: 'var(--gray-50)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <form onSubmit={openConfirmModal}>
                        {error && (
                            <div style={{ 
                                background: '#fee2e2', 
                                color: '#991b1b', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                marginBottom: '24px',
                                fontSize: '14px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
                            <div>
                                {/* Jadwal Reservasi */}
                                <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        📅 Jadwal Reservasi
                                    </h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label className="form-label">Tanggal *</label>
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
                                        <div>
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
                                    </div>

                                    {item?.service?.name === 'Prasmanan' && (
                                        <div style={{ marginTop: '16px' }}>
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
                                </div>

                                {/* Alamat Layanan */}
                                <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        📍 Alamat Layanan
                                    </h3>
                                    
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label className="form-label">Alamat Lengkap * (Nama Jalan, RT/RW, No. Rumah)</label>
                                            <textarea
                                                name="addressStreet"
                                                className="form-textarea"
                                                value={formData.addressStreet}
                                                onChange={handleChange}
                                                placeholder="Contoh: Jl. Mawar No. 123, RT 01/RW 02"
                                                rows={2}
                                                required
                                            />
                                        </div>

                                        {/* Province Dropdown */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="form-label">Provinsi *</label>
                                                <select
                                                    name="provinceId"
                                                    className="form-select"
                                                    value={formData.provinceId}
                                                    onChange={handleProvinceChange}
                                                    required
                                                    disabled={loadingWilayah.provinces}
                                                >
                                                    <option value="">{loadingWilayah.provinces ? 'Memuat...' : 'Pilih Provinsi'}</option>
                                                    {provinces.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* City Dropdown */}
                                            <div>
                                                <label className="form-label">Kota/Kabupaten *</label>
                                                <select
                                                    name="cityId"
                                                    className="form-select"
                                                    value={formData.cityId}
                                                    onChange={handleCityChange}
                                                    required
                                                    disabled={!formData.provinceId || loadingWilayah.cities}
                                                >
                                                    <option value="">
                                                        {!formData.provinceId ? 'Pilih provinsi dulu' : loadingWilayah.cities ? 'Memuat...' : 'Pilih Kota/Kabupaten'}
                                                    </option>
                                                    {cities.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* District & Village Dropdown */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="form-label">Kecamatan *</label>
                                                <select
                                                    name="kecamatanId"
                                                    className="form-select"
                                                    value={formData.kecamatanId}
                                                    onChange={handleDistrictChange}
                                                    required
                                                    disabled={!formData.cityId || loadingWilayah.districts}
                                                >
                                                    <option value="">
                                                        {!formData.cityId ? 'Pilih kota dulu' : loadingWilayah.districts ? 'Memuat...' : 'Pilih Kecamatan'}
                                                    </option>
                                                    {districts.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label">Desa/Kelurahan *</label>
                                                <select
                                                    name="kelurahanId"
                                                    className="form-select"
                                                    value={formData.kelurahanId}
                                                    onChange={handleVillageChange}
                                                    required
                                                    disabled={!formData.kecamatanId || loadingWilayah.villages}
                                                >
                                                    <option value="">
                                                        {!formData.kecamatanId ? 'Pilih kecamatan dulu' : loadingWilayah.villages ? 'Memuat...' : 'Pilih Desa/Kelurahan'}
                                                    </option>
                                                    {villages.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="form-label">Kode Pos</label>
                                                <input
                                                    name="postalCode"
                                                    className="form-input"
                                                    value={formData.postalCode}
                                                    onChange={handleChange}
                                                    placeholder="12345"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">No. HP Penerima *</label>
                                                <input
                                                    name="contactPhone"
                                                    className="form-input"
                                                    value={formData.contactPhone}
                                                    onChange={handleChange}
                                                    placeholder="08xxxxxxxxxx"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '8px' }}>
                                            <label className="form-label">Bagikan Lokasi GPS</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    onClick={handleGetLocation}
                                                    disabled={locationLoading}
                                                    style={{
                                                        padding: '12px 20px',
                                                        background: 'var(--gray-100)',
                                                        border: '2px solid var(--gray-200)',
                                                        borderRadius: '12px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    📍 {locationLoading ? 'Mendapatkan...' : 'Ambil Lokasi Saya'}
                                                </button>
                                                
                                                {locationStatus === 'success' && (
                                                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>
                                                        ✓ Lokasi tersimpan
                                                    </span>
                                                )}
                                                {locationStatus === 'error' && (
                                                    <span style={{ color: '#dc2626', fontSize: '14px' }}>
                                                        ✗ Gagal mendapatkan lokasi
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {formData.latitude && formData.longitude && (
                                                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-500)' }}>
                                                    Koordinat: {formData.latitude}, {formData.longitude}
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ marginLeft: '12px', color: 'var(--primary-500)' }}
                                                    >
                                                        Lihat di Maps →
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Catatan Tambahan */}
                                <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        📝 Catatan Tambahan
                                    </h3>
                                    <textarea
                                        name="notes"
                                        className="form-textarea"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Tulis permintaan khusus atau catatan tambahan di sini... (opsional)"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Sidebar - Order Summary */}
                            <div>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                    position: 'sticky',
                                    top: '100px'
                                }}>
                                    {item && (
                                        <>
                                            <img
                                                src={item.imageUrl || item.service?.imageUrl || 'https://via.placeholder.com/350x180'}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '160px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <div style={{ padding: '24px' }}>
                                                <div style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600, marginBottom: '6px' }}>
                                                    {item.service?.icon} {item.service?.name}
                                                </div>
                                                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                                                    {item.name}
                                                </h4>
                                                
                                                {item.duration && (
                                                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
                                                        ⏱️ Durasi: {item.duration} menit
                                                    </div>
                                                )}

                                                <div style={{
                                                    borderTop: '1px solid var(--gray-100)',
                                                    paddingTop: '16px',
                                                    marginTop: '16px'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                        <span style={{ color: 'var(--gray-500)' }}>Total Bayar</span>
                                                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-600)' }}>
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                                                    >
                                                        🛒 Lanjut ke Pembayaran
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            {/* Confirmation Modal */}
            {showModal && item && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#1e1e1e',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '550px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        color: 'white'
                    }}>
                        <div style={{ 
                            padding: '24px', 
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                🛒 Konfirmasi Pesanan
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ 
                                    background: 'none', border: 'none', color: 'white', 
                                    fontSize: '24px', cursor: 'pointer' 
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ 
                                background: '#2a2a2a', 
                                padding: '20px', 
                                borderRadius: '16px', 
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: '#aaa' }}>Total Bayar:</span>
                                <span style={{ fontSize: '28px', fontWeight: 800, color: '#f97316' }}>
                                    {formatPrice(item.price)}
                                </span>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Metode Pembayaran *</label>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {paymentMethods.map(method => (
                                        <label 
                                            key={method.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '16px 20px',
                                                background: formData.paymentMethod === method.id ? '#3a3a3a' : '#2a2a2a',
                                                border: `2px solid ${formData.paymentMethod === method.id ? '#f97316' : '#3a3a3a'}`,
                                                borderRadius: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={formData.paymentMethod === method.id}
                                                onChange={handleChange}
                                                style={{ accentColor: '#f97316' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{method.name}</div>
                                                <div style={{ fontSize: '12px', color: '#888' }}>{method.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>📍 Alamat Pengiriman</label>
                                <div style={{ 
                                    background: '#2a2a2a', 
                                    padding: '16px 20px', 
                                    borderRadius: '14px',
                                    fontSize: '14px',
                                    lineHeight: 1.6
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{formData.addressStreet}</div>
                                    <div style={{ color: '#aaa' }}>
                                        {formData.kelurahanName}, {formData.kecamatanName}<br/>
                                        {formData.cityName}, {formData.provinceName} {formData.postalCode && ` ${formData.postalCode}`}
                                    </div>
                                    <div style={{ color: '#888', marginTop: '8px' }}>📱 {formData.contactPhone}</div>
                                    
                                    {formData.latitude && formData.longitude && (
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #3a3a3a' }}>
                                            <span style={{ color: '#16a34a' }}>✓ Koordinat GPS tersimpan</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>📅 Jadwal</label>
                                <div style={{ 
                                    background: '#2a2a2a', 
                                    padding: '16px 20px', 
                                    borderRadius: '14px',
                                    fontSize: '14px'
                                }}>
                                    {new Date(formData.date).toLocaleDateString('id-ID', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })} • {formData.time} WIB
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '16px',
                                        background: '#3a3a3a',
                                        border: 'none',
                                        borderRadius: '14px',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        border: 'none',
                                        borderRadius: '14px',
                                        color: 'white',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {submitting ? '⏳ Memproses...' : `🛒 Pesan Sekarang - ${formatPrice(item.price)}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
