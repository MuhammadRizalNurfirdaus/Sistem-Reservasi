import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Kontak Kami</h3>
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
                            <a href="https://www.instagram.com/crawasy_zall?igsh=MXZjMnRuYnJhczNxbg==" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-400)' }}>
                                @crawasy_zall
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-title">Layanan</h4>
                        <ul className="footer-links">
                            <li><Link to="/services" className="footer-link">Salon</Link></li>
                            <li><Link to="/services" className="footer-link">Prasmanan</Link></li>
                            <li><Link to="/services" className="footer-link">Riasan</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Perusahaan</h4>
                        <ul className="footer-links">
                            <li><a href="#" className="footer-link">Tentang Kami</a></li>
                            <li><a href="#" className="footer-link">Karir</a></li>
                            <li><a href="#" className="footer-link">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Bantuan</h4>
                        <ul className="footer-links">
                            <li><a href="#" className="footer-link">FAQ</a></li>
                            <li><a href="#" className="footer-link">Kontak</a></li>
                            <li><a href="#" className="footer-link">Kebijakan Privasi</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 Reservasi. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
