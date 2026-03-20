import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-brand">
                            <span>✨</span> Reservasi
                        </div>
                        <p className="footer-desc">
                            Platform reservasi layanan terpercaya #1 di Indonesia. Kami menyediakan kemudahan
                            booking layanan kecantikan dan catering dalam satu platform modern.
                        </p>
                        <div className="footer-social">
                            <a href="https://www.instagram.com/crawasy_zall" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">📷</a>
                            <a href="https://wa.me/6289540129447" target="_blank" rel="noopener noreferrer" className="social-link" title="WhatsApp">💬</a>
                            <a href="https://github.com/MuhammadRizalNurfirdaus" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">🐙</a>
                            <a href="mailto:muhammadrizalnurfirdaus@gmail.com" className="social-link" title="Email">📧</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-title">Layanan</h4>
                        <ul className="footer-links">
                            <li><Link to="/services" className="footer-link">💇 Salon</Link></li>
                            <li><Link to="/services" className="footer-link">🍽️ Prasmanan</Link></li>
                            <li><Link to="/services" className="footer-link">💄 Riasan</Link></li>
                            <li><Link to="/services" className="footer-link">✨ Premium</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Perusahaan</h4>
                        <ul className="footer-links">
                            <li><Link to="/" className="footer-link">Tentang Kami</Link></li>
                            <li><Link to="/services" className="footer-link">Layanan</Link></li>
                            <li><Link to="/" className="footer-link">Kebijakan Privasi</Link></li>
                            <li><Link to="/" className="footer-link">Syarat & Ketentuan</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Kontak</h4>
                        <div className="contact-item">
                            <span>📞</span>
                            <span>+62 895-4012-94477</span>
                        </div>
                        <div className="contact-item">
                            <span>📧</span>
                            <span>muhammadrizalnurfirdaus@gmail.com</span>
                        </div>
                        <div className="contact-item">
                            <span>📷</span>
                            <a href="https://www.instagram.com/crawasy_zall" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-400)' }}>
                                @crawasy_zall
                            </a>
                        </div>

                        <div className="footer-newsletter" style={{ marginTop: '20px' }}>
                            <h4 className="footer-title" style={{ fontSize: '14px', marginBottom: '12px' }}>Newsletter</h4>
                            <div className="newsletter-form">
                                <input type="email" className="newsletter-input" placeholder="Email Anda..." />
                                <button className="newsletter-btn">→</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Sistem Reservasi — Muhammad Rizal Nurfirdaus. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
