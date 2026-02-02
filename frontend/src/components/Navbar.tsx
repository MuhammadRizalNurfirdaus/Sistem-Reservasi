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

    const isActive = (path: string) => location.pathname === path;

    const getAvatarUrl = () => {
        if (user?.avatar) {
            return getImageUrl(user.avatar);
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ec4899&color=fff`;
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div className="navbar-brand">
                    <span>✨</span>
                    Reservasi
                </div>

                <div className="navbar-nav">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        Beranda
                    </Link>
                    <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
                        Layanan
                    </Link>
                    {user && user.role === 'CUSTOMER' && (
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') || location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                            Akun Saya
                        </Link>
                    )}
                    {user?.role === 'OWNER' && (
                        <Link to="/owner" className={`nav-link ${isActive('/owner') ? 'active' : ''}`} style={{ color: '#f59e0b', fontWeight: 600 }}>
                            👑 Dashboard Owner
                        </Link>
                    )}
                    {user?.role === 'ADMIN' && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                            Dashboard Admin
                        </Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu" style={{ cursor: 'pointer' }}>
                            <Link to={user.role === 'CUSTOMER' ? '/dashboard?tab=profil' : '/profile'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                <img
                                    src={getAvatarUrl()}
                                    alt={user.name}
                                    className="user-avatar"
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <span className="user-name">{user.name}</span>
                            </Link>
                            <button className="btn btn-sm btn-secondary" onClick={logout} style={{ marginLeft: '12px' }}>
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
