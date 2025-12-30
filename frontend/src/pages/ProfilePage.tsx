import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authApi } from '../services/api';

export default function ProfilePage() {
    const { user, checkAuth } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        password: '',
        confirmPassword: '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p>Silakan login terlebih dahulu</p>
                </div>
                <Footer />
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            if (formData.password) {
                if (formData.password !== formData.confirmPassword) {
                    alert('Password konfirmasi tidak sesuai!');
                    setLoading(false);
                    return;
                }
                data.append('password', formData.password);
                data.append('confirmPassword', formData.confirmPassword);
            }
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            await authApi.updateProfile(data);
            await checkAuth(); // Refresh user data
            setIsEditing(false);
            setAvatarFile(null);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            alert('Profil berhasil diperbarui!');
        } catch (error: any) {
            console.error('Update failed:', error);
            alert(error.message || 'Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Profil Pengguna</h1>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>Informasi akun Anda</p>

                    <div className="card" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ec4899&color=fff&size=128`}
                            alt={user.name}
                            style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '24px', border: '4px solid var(--primary-100)', objectFit: 'cover' }}
                        />

                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{user.name}</h2>
                        <span style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: user.role === 'ADMIN' ? 'var(--primary-50)' : 'var(--gray-100)',
                            color: user.role === 'ADMIN' ? 'var(--primary-600)' : 'var(--gray-600)',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '32px'
                        }}>
                            {user.role}
                        </span>

                        <div style={{ display: 'grid', gap: '16px', textAlign: 'left', background: 'var(--gray-50)', padding: '24px', borderRadius: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>Alamat Email</label>
                                <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{user.email}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>ID Pengguna</label>
                                <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--gray-500)' }}>{user.id}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                Edit Profil
                            </button>
                            {user.role === 'ADMIN' && (
                                <a href="/admin" className="btn btn-primary">
                                    Ke Dashboard Admin
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Edit Profil</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nama Lengkap</label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Foto Profil</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="form-input"
                                    style={{ padding: '8px' }}
                                />
                                {avatarFile && <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>File terpilih: {avatarFile.name}</p>}
                            </div>

                            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                            <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '16px' }}>Ganti Password (Kosongkan jika tidak ingin mengubah)</p>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
