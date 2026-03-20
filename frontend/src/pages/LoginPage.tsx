import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const { user, loading: authLoading, loginWithGoogle, loginWithEmail } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'ADMIN') navigate('/admin', { replace: true });
            else if (user.role === 'OWNER') navigate('/owner', { replace: true });
            else navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await loginWithEmail(formData);
            if (user?.role === 'ADMIN') navigate('/admin');
            else if (user?.role === 'OWNER') navigate('/owner');
            else navigate('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Email atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="login-page">
            <div className="login-container animate-fade-in">
                {/* Left: Illustration */}
                <div className="login-illustration">
                    <h2>Selamat Datang Kembali! 👋</h2>
                    <p>
                        Masuk ke akun Anda untuk menikmati kemudahan booking layanan Salon, Prasmanan, dan Riasan profesional.
                    </p>
                    <ul className="login-illustration-features">
                        <li>✅ Booking cepat dalam hitungan menit</li>
                        <li>📊 Pantau status reservasi real-time</li>
                        <li>💰 Harga transparan tanpa biaya tersembunyi</li>
                        <li>⭐ Layanan terpercaya & terverifikasi</li>
                    </ul>
                </div>

                {/* Right: Form */}
                <div className="login-card">
                    <div className="login-icon">✨</div>
                    <h1 className="login-title">Masuk</h1>
                    <p className="login-subtitle">Masuk untuk booking layanan favorit Anda</p>

                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">📧 Email</label>
                            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="contoh@email.com" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🔒 Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password" className="form-input"
                                    value={formData.password} onChange={handleChange}
                                    required style={{ paddingRight: '48px' }}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? '⏳ Memproses...' : '🚀 Masuk'}
                        </button>
                    </form>

                    <div className="login-divider">atau masuk dengan</div>

                    <button className="btn btn-google" onClick={loginWithGoogle} style={{ width: '100%' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '24px' }}>
                        Belum punya akun? <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Daftar sekarang</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
