import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
        }
    }, [user, navigate]);

    const isActive = (path: string) => location.pathname === path;

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', background: 'white', borderRight: '1px solid var(--gray-200)', position: 'fixed', top: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Panel
                    </div>
                </div>

                <nav style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} style={navItemStyle(isActive('/admin'))}>
                            📊 Dashboard
                        </Link>
                        <Link to="/admin/services" className={`nav-item ${isActive('/admin/services') ? 'active' : ''}`} style={navItemStyle(isActive('/admin/services'))}>
                            💇 Salons & Services
                        </Link>
                        <Link to="/admin/reservations" className={`nav-item ${isActive('/admin/reservations') ? 'active' : ''}`} style={navItemStyle(isActive('/admin/reservations'))}>
                            📅 Reservations
                        </Link>
                    </div>


                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid var(--gray-100)' }}>
                    <Link to="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                            {user.avatar ? (
                                <img src={user.avatar} alt="A" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : 'A'}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Administrator</div>
                        </div>
                    </Link>
                    <button onClick={logout} className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)', justifyContent: 'center' }}>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <Outlet />
            </main>
        </div>
    );
}

const navItemStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: active ? 'white' : 'var(--gray-600)',
    background: active ? 'var(--gradient-primary)' : 'transparent',
    fontWeight: active ? 600 : 500,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
});
