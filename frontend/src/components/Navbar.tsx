import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

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
                    {user && (
                        <Link to="/my-reservations" className={`nav-link ${isActive('/my-reservations') ? 'active' : ''}`}>
                            Reservasi Saya
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
                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ec4899&color=fff`}
                                    alt={user.name}
                                    className="user-avatar"
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
