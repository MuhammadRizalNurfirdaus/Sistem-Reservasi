import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const getAvatarUrl = () => {
        if (user?.avatar) return getImageUrl(user.avatar);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`;
    };

    const navLinks = (
        <>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Beranda</Link>
            <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>Layanan</Link>
            {user && user.role === 'CUSTOMER' && (
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') || location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                    Akun Saya
                </Link>
            )}
            {user?.role === 'OWNER' && (
                <Link to="/owner" className={`nav-link ${isActive('/owner') ? 'active' : ''}`} style={{ color: '#f59e0b', fontWeight: 600 }}>
                    👑 Owner
                </Link>
            )}
            {user?.role === 'ADMIN' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                    🛠️ Admin
                </Link>
            )}
        </>
    );

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span>✨</span>
                        Reservasi
                    </Link>

                    <div className="navbar-nav">{navLinks}</div>

                    <div className="navbar-actions">
                        {user ? (
                            <div className="user-menu">
                                <Link to={user.role === 'CUSTOMER' ? '/dashboard?tab=profil' : '/profile'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                    <img src={getAvatarUrl()} alt={user.name} className="user-avatar" />
                                    <span className="user-name">{user.name}</span>
                                </Link>
                                <button className="btn btn-sm btn-secondary" onClick={logout} style={{ marginLeft: '12px' }}>
                                    Keluar
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary">Masuk</Link>
                        )}

                        <button
                            className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <div className={`mobile-nav-overlay ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)} />
            <div className={`mobile-nav ${mobileOpen ? 'active' : ''}`}>
                {navLinks}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--gray-100)' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <img src={getAvatarUrl()} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{user.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{user.role}</div>
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={logout} style={{ width: '100%' }}>
                                Keluar
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
