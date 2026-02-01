import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Provinsi { id: string; name: string; }
interface Kabupaten { id: string; name: string; }
interface Kecamatan { id: string; name: string; }
interface Desa { id: string; name: string; }

export default function RegisterPage() {
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        provinsiId: '',
        kabupatenId: '',
        kecamatanId: '',
        desaId: '',
        alamatDetail: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Address data
    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [desaList, setDesaList] = useState<Desa[]>([]);
    const [addressNames, setAddressNames] = useState({ provinsi: '', kabupaten: '', kecamatan: '', desa: '' });

    // Fetch Provinsi
    useEffect(() => {
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then(res => res.json())
            .then(data => setProvinsiList(data))
            .catch(err => console.error('Error fetching provinsi:', err));
    }, []);

    // Fetch Kabupaten
    useEffect(() => {
        if (formData.provinsiId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${formData.provinsiId}.json`)
                .then(res => res.json())
                .then(data => setKabupatenList(data))
                .catch(err => console.error('Error fetching kabupaten:', err));
            setFormData(prev => ({ ...prev, kabupatenId: '', kecamatanId: '', desaId: '' }));
            setKecamatanList([]);
            setDesaList([]);
        }
    }, [formData.provinsiId]);

    // Fetch Kecamatan
    useEffect(() => {
        if (formData.kabupatenId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${formData.kabupatenId}.json`)
                .then(res => res.json())
                .then(data => setKecamatanList(data))
                .catch(err => console.error('Error fetching kecamatan:', err));
            setFormData(prev => ({ ...prev, kecamatanId: '', desaId: '' }));
            setDesaList([]);
        }
    }, [formData.kabupatenId]);

    // Fetch Desa
    useEffect(() => {
        if (formData.kecamatanId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${formData.kecamatanId}.json`)
                .then(res => res.json())
                .then(data => setDesaList(data))
                .catch(err => console.error('Error fetching desa:', err));
            setFormData(prev => ({ ...prev, desaId: '' }));
        }
    }, [formData.kecamatanId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasi password
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan Konfirmasi Password tidak sama!');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter!');
            setLoading(false);
            return;
        }

        // Build full address
        const fullAddress = [
            formData.alamatDetail,
            addressNames.desa ? `Desa ${addressNames.desa}` : '',
            addressNames.kecamatan ? `Kec. ${addressNames.kecamatan}` : '',
            addressNames.kabupaten,
            addressNames.provinsi
        ].filter(Boolean).join(', ');

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: fullAddress
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Gagal mendaftar. Email mungkin sudah terdaftar.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Update address names
        if (name === 'provinsiId') {
            const prov = provinsiList.find(p => p.id === value);
            setAddressNames(prev => ({ ...prev, provinsi: prov?.name || '', kabupaten: '', kecamatan: '', desa: '' }));
        } else if (name === 'kabupatenId') {
            const kab = kabupatenList.find(k => k.id === value);
            setAddressNames(prev => ({ ...prev, kabupaten: kab?.name || '', kecamatan: '', desa: '' }));
        } else if (name === 'kecamatanId') {
            const kec = kecamatanList.find(k => k.id === value);
            setAddressNames(prev => ({ ...prev, kecamatan: kec?.name || '', desa: '' }));
        } else if (name === 'desaId') {
            const des = desaList.find(d => d.id === value);
            setAddressNames(prev => ({ ...prev, desa: des?.name || '' }));
        }
    };

    const passwordMatch = formData.confirmPassword === '' || formData.password === formData.confirmPassword;

    return (
        <div className="login-page" style={{ padding: '40px 20px' }}>
            <div className="login-card animate-fade-in" style={{ padding: '40px', maxWidth: '500px' }}>
                <div className="login-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h1 className="login-title">Daftar Akun</h1>
                <p className="login-subtitle">
                    Buat akun baru untuk mulai booking
                </p>

                {error && (
                    <div className="alert alert-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Nama Lengkap */}
                    <div className="form-group">
                        <label className="form-label">👤 Nama Lengkap *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">📧 Email *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="contoh@email.com"
                            required
                        />
                    </div>

                    {/* No Telepon */}
                    <div className="form-group">
                        <label className="form-label">📱 No. Telepon *</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                            pattern="[0-9]{10,15}"
                            required
                        />
                    </div>

                    {/* Alamat Section */}
                    <div style={{ 
                        background: 'var(--gray-50)', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        marginBottom: '16px',
                        border: '1px solid var(--gray-200)'
                    }}>
                        <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
                            📍 Alamat Lengkap
                        </label>

                        {/* Provinsi & Kabupaten */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <select
                                name="provinsiId"
                                className="form-input"
                                value={formData.provinsiId}
                                onChange={handleChange}
                                style={{ fontSize: '14px' }}
                            >
                                <option value="">-- Provinsi --</option>
                                {provinsiList.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <select
                                name="kabupatenId"
                                className="form-input"
                                value={formData.kabupatenId}
                                onChange={handleChange}
                                disabled={!formData.provinsiId}
                                style={{ fontSize: '14px' }}
                            >
                                <option value="">-- Kota/Kabupaten --</option>
                                {kabupatenList.map(k => (
                                    <option key={k.id} value={k.id}>{k.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Kecamatan & Desa */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <select
                                name="kecamatanId"
                                className="form-input"
                                value={formData.kecamatanId}
                                onChange={handleChange}
                                disabled={!formData.kabupatenId}
                                style={{ fontSize: '14px' }}
                            >
                                <option value="">-- Kecamatan --</option>
                                {kecamatanList.map(k => (
                                    <option key={k.id} value={k.id}>{k.name}</option>
                                ))}
                            </select>
                            <select
                                name="desaId"
                                className="form-input"
                                value={formData.desaId}
                                onChange={handleChange}
                                disabled={!formData.kecamatanId}
                                style={{ fontSize: '14px' }}
                            >
                                <option value="">-- Desa/Kelurahan --</option>
                                {desaList.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Alamat Detail */}
                        <textarea
                            name="alamatDetail"
                            className="form-input"
                            value={formData.alamatDetail}
                            onChange={handleChange}
                            placeholder="Nama jalan, RT/RW, nomor rumah, patokan..."
                            rows={2}
                            style={{ fontSize: '14px', resize: 'none' }}
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">🔒 Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                                style={{ paddingRight: '50px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: '4px'
                                }}
                                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="form-group">
                        <label className="form-label">🔒 Konfirmasi Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Ulangi password"
                                required
                                minLength={6}
                                style={{ 
                                    paddingRight: '50px',
                                    borderColor: !passwordMatch ? '#dc2626' : undefined,
                                    background: !passwordMatch ? '#fef2f2' : undefined
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: '4px'
                                }}
                                title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {!passwordMatch && (
                            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                ⚠️ Password tidak sama!
                            </p>
                        )}
                        {passwordMatch && formData.confirmPassword && (
                            <p style={{ color: '#16a34a', fontSize: '12px', marginTop: '4px' }}>
                                ✅ Password cocok!
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
                        disabled={loading || !passwordMatch}
                    >
                        {loading ? '⏳ Memproses...' : '🚀 Daftar Sekarang'}
                    </button>
                </form>

                <div className="login-divider">atau daftar dengan</div>

                <button className="btn btn-google" onClick={loginWithGoogle} style={{ width: '100%', padding: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '24px' }}>
                    Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Masuk</Link>
                </p>
            </div>
        </div>
    );
}
