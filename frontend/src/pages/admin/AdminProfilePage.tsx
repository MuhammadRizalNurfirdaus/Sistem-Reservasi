import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/api';

export default function AdminProfilePage() {
    const { user, checkAuth } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        password: '',
        confirmPassword: '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    if (!user) return null;

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
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gray-900)' }}>Profil Admin</h1>
                <p style={{ color: 'var(--gray-500)' }}>Kelola informasi akun administrator Anda</p>
            </div>

            <div className="card" style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '32px' }}>
                    <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ec4899&color=fff&size=128`}
                        alt={user.name}
                        style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--primary-50)', objectFit: 'cover' }}
                    />
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{user.name}</h2>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: 'var(--primary-50)',
                                color: 'var(--primary-600)',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 600
                            }}>
                                {user.role}
                            </span>
                            <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{user.email}</span>
                        </div>
                    </div>
                </div>

                {isEditing ? (
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

                        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--gray-100)' }} />
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
                ) : (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>Role</label>
                                <div style={{ fontWeight: 500 }}>{user.role}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>Status</label>
                                <div style={{ fontWeight: 500, color: 'var(--success)' }}>Active</div>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Profil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
