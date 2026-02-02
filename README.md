# 🗓️ Sistem Reservasi

> **✅ Status: Production Ready**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/MuhammadRizalNurfirdaus/Sistem-Reservasi.git)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge)]()

Sistem Reservasi adalah aplikasi web full-stack untuk manajemen reservasi layanan yang dibangun dengan teknologi modern. Aplikasi ini memungkinkan pengguna untuk memesan berbagai layanan, pemilik bisnis untuk memantau performa, dan admin untuk mengelola seluruh sistem.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Instalasi](#-instalasi)
- [Deploy ke VPS](#-deploy-ke-vps)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Kontributor](#-kontributor)

## ✨ Fitur

### 👤 Fitur Customer
- 🔐 Autentikasi (Register, Login, Google OAuth)
- 📝 Melihat daftar layanan yang tersedia
- 📅 Membuat reservasi layanan dengan pilihan metode pembayaran (COD/Transfer)
- 📊 Dashboard dengan riwayat reservasi
- 👤 Mengelola profil dengan alamat lengkap (Provinsi → Kota → Kecamatan → Desa)
- 🖼️ Upload avatar profil

### 👔 Fitur Owner (Pemilik Bisnis)
- 📈 Dashboard laporan bisnis dengan grafik real-time (Recharts)
- 💰 Laporan pendapatan dengan chart area
- 📊 Statistik reservasi bulanan dengan bar chart
- 🥧 Pie chart status reservasi
- 📋 Monitoring layanan populer

### 🔧 Fitur Admin
- 📈 Dashboard statistik lengkap
- 🛠️ Manajemen layanan & item (CRUD dengan upload foto)
- 📋 Manajemen reservasi (Update Status, Update Pembayaran)
- 🔄 Toggle ketersediaan item langsung dari badge
- 👥 Filter reservasi berdasarkan status

## 🛠️ Tech Stack

### Backend
| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| Node.js | 20+ | Runtime JavaScript |
| Express.js | ^4.18.2 | Web Framework |
| TypeScript | ^5.3.3 | Bahasa Pemrograman |
| Prisma | ^6.19.1 | ORM Database |
| PostgreSQL | 16 | Database |
| Passport.js | ^0.7.0 | Autentikasi |
| bcrypt | ^6.0.0 | Hashing Password |
| Multer | ^2.0.0 | File Upload |

### Frontend
| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| React | ^19.2.0 | UI Library |
| TypeScript | ~5.9.3 | Bahasa Pemrograman |
| Vite | ^7.2.4 | Build Tool |
| React Router | ^7.11.0 | Routing |
| Recharts | ^3.6.0 | Chart Library |

## 📁 Struktur Project

```
Sistem-Reservasi/
├── backend/                 # Backend API
│   ├── prisma/             # Prisma schema & migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── src/
│   │   ├── config/         # Konfigurasi (passport, dll)
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Entry point
│   └── uploads/            # File uploads
│
├── frontend/               # Frontend React
│   ├── public/             # Static files
│   └── src/
│       ├── assets/         # Images, fonts, dll
│       ├── components/     # Reusable components
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # Layout components
│       ├── pages/          # Page components
│       │   └── admin/      # Admin pages
│       ├── services/       # API services
│       └── types/          # TypeScript types
│
└── package.json            # Root package.json
```

## 🚀 Instalasi

### Opsi 1: Docker (Direkomendasikan) 🐳

Cara termudah untuk menjalankan aplikasi ini adalah menggunakan Docker.

#### Prasyarat
- Docker & Docker Compose

#### Langkah Instalasi dengan Docker

1. **Clone repository**
   ```bash
   git clone https://github.com/MuhammadRizalNurfirdaus/Sistem-Reservasi.git
   cd Sistem-Reservasi
   ```

2. **Jalankan dengan Docker**
   ```bash
   # Buat file .env dari template
   cp .env.example .env
   
   # Build dan jalankan
   docker compose up -d --build
   
   # Tunggu sampai container berjalan, lalu jalankan migrasi dan seeding
   docker compose exec backend npx prisma db push
   docker compose exec backend npx tsx prisma/seed.ts
   ```

3. **Akses Aplikasi**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Database: localhost:5433

4. **Login Akun Default**
   
   | Role | Email | Password |
   |------|-------|----------|
   | Admin | `admin@gmail.com` | `admin123` |
   | Owner | `owner@gmail.com` | `owner123` |
   | Customer | Login dengan Google OAuth | - |

#### Docker Commands
```bash
# Lihat logs
docker compose logs -f

# Stop aplikasi
docker compose down

# Restart
docker compose restart

# Rebuild setelah perubahan kode
docker compose up -d --build
```

---

## 🌍 Deploy ke VPS

### Prasyarat VPS
- Ubuntu 20.04+ atau Debian
- PostgreSQL terinstall
- Node.js 20+
- Nginx
- PM2
- SSL Certificate

### Langkah Deploy

1. **Buat folder project di VPS**
   ```bash
   mkdir -p /root/Sistem-Reservasi/uploads/avatars
   mkdir -p /root/Sistem-Reservasi/uploads/items
   mkdir -p /root/Sistem-Reservasi/frontend
   ```

2. **Upload file dari local ke VPS**
   ```bash
   # Upload backend
   scp -r backend/src backend/prisma backend/package.json backend/tsconfig.json root@YOUR_VPS_IP:/root/Sistem-Reservasi/backend/
   
   # Build frontend di local dulu
   cd frontend && npm run build
   
   # Upload frontend dist
   scp -r frontend/dist root@YOUR_VPS_IP:/root/Sistem-Reservasi/frontend/
   ```

3. **Buat file .env di VPS** (`/root/Sistem-Reservasi/backend/.env`)
   ```env
   DATABASE_URL=postgresql://reservasi:reservasi123@localhost:5432/reservasi_db?schema=public
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   SESSION_SECRET=your-super-secret-session-key
   PORT=4111
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```

4. **Setup Database PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE USER reservasi WITH PASSWORD 'reservasi123';
   CREATE DATABASE reservasi_db OWNER reservasi;
   GRANT ALL PRIVILEGES ON DATABASE reservasi_db TO reservasi;
   \q
   ```

5. **Install dependencies & setup database**
   ```bash
   cd /root/Sistem-Reservasi/backend
   npm install
   npm run build
   npx prisma generate
   npx prisma db push
   npx ts-node prisma/seed.ts
   ```

6. **Setup Nginx** (`/etc/nginx/sites-available/reservasi`)
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.key;

       root /root/Sistem-Reservasi/frontend/dist;
       index index.html;

       location /uploads/ {
           alias /root/Sistem-Reservasi/uploads/;
           expires 30d;
           add_header Cache-Control "public, immutable";
       }

       location /api/ {
           proxy_pass http://127.0.0.1:4111;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           try_files $uri $uri/ /index.html;
       }
   }

   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$host$request_uri;
   }
   ```

7. **Enable site & reload nginx**
   ```bash
   ln -sf /etc/nginx/sites-available/reservasi /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

8. **Start backend dengan PM2**
   ```bash
   cd /root/Sistem-Reservasi/backend
   pm2 start npm --name "reservasi-backend" -- start
   pm2 save
   pm2 startup
   ```

9. **Update Google OAuth** di Google Cloud Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

---

### Opsi 2: Manual Installation

#### Prasyarat
- Node.js (v18 atau lebih baru)
- PostgreSQL
- npm atau yarn

#### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/MuhammadRizalNurfirdaus/Sistem-Reservasi.git
   cd Sistem-Reservasi
   ```

2. **Install dependencies**
   ```bash
   # Install semua dependencies (root, backend, frontend)
   npm run install:all
   
   # Atau install manual
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Setup Database**
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

4. **Seed Database (opsional)**
   ```bash
   npm run db:seed
   ```

## ⚙️ Konfigurasi

### Backend Environment Variables

Buat file `.env` di folder `backend/`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sistem_reservasi"

# Server
PORT=5000
NODE_ENV=development

# Session
SESSION_SECRET=your-super-secret-session-key

# Frontend URL (untuk CORS)
FRONTEND_URL=http://localhost:5173

# Google OAuth (opsional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

### Frontend Environment Variables

Buat file `.env` di folder `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

## ▶️ Menjalankan Aplikasi

### Development Mode

```bash
# Jalankan backend dan frontend bersamaan
npm run dev:all

# Atau jalankan terpisah
npm run dev:backend    # Backend di port 5000
npm run dev:frontend   # Frontend di port 5173
```

### Production Build

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

## 🗃️ Database Schema

### Models

#### User
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | String | Primary key (CUID) |
| googleId | String? | Google OAuth ID |
| email | String | Email (unique) |
| password | String? | Hashed password |
| name | String | Nama lengkap |
| phone | String? | Nomor telepon |
| address | String? | Alamat lengkap |
| province | String? | Provinsi |
| city | String? | Kota/Kabupaten |
| district | String? | Kecamatan |
| village | String? | Desa/Kelurahan |
| avatar | String? | URL avatar |
| role | Role | CUSTOMER / ADMIN / OWNER |

#### Service
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | String | Primary key (CUID) |
| name | String | Nama layanan (unique) |
| description | String? | Deskripsi layanan |
| imageUrl | String? | URL gambar |
| icon | String? | Icon identifier |

#### ServiceItem
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | String | Primary key (CUID) |
| serviceId | String | Foreign key ke Service |
| name | String | Nama item |
| price | Decimal | Harga |
| duration | Int? | Durasi (menit) |
| isAvailable | Boolean | Status ketersediaan |

#### Reservation
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | String | Primary key (CUID) |
| userId | String | Foreign key ke User |
| serviceItemId | String | Foreign key ke ServiceItem |
| date | DateTime | Tanggal reservasi |
| time | String | Waktu reservasi |
| status | ReservationStatus | PENDING / CONFIRMED / CANCELLED / COMPLETED |
| notes | String? | Catatan tambahan |
| address | String | Alamat lengkap |
| province | String? | Provinsi |
| city | String? | Kota/Kabupaten |
| district | String? | Kecamatan |
| village | String? | Desa/Kelurahan |
| paymentMethod | String? | COD / TRANSFER |
| isPaid | Boolean | Status pembayaran |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Services
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/services` | Get semua layanan dengan items |
| GET | `/api/services/:id` | Get detail layanan |
| POST | `/api/services` | Buat layanan baru (Admin) |
| PUT | `/api/services/:id` | Update layanan (Admin) |
| DELETE | `/api/services/:id` | Hapus layanan (Admin) |
| POST | `/api/services/:id/items` | Tambah item ke layanan (Admin) |
| PUT | `/api/services/:serviceId/items/:itemId` | Update item (Admin) |
| DELETE | `/api/services/:serviceId/items/:itemId` | Hapus item (Admin) |

### Reservations
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/reservations` | Get reservasi user login |
| GET | `/api/reservations/admin` | Get semua reservasi (Admin/Owner) |
| POST | `/api/reservations` | Buat reservasi baru |
| PUT | `/api/reservations/:id` | Update status/pembayaran (Admin) |
| DELETE | `/api/reservations/:id` | Batalkan reservasi |

### Health Check
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Cek status API |

## 📸 Screenshots

> *Screenshots akan ditambahkan setelah development selesai*

## 🔮 Roadmap

- [x] Multi-role System (Admin, Owner, Customer)
- [x] Google OAuth Integration
- [x] Cascading Address Dropdown (Provinsi → Kota → Kecamatan → Desa)
- [x] Admin Dashboard dengan Statistik
- [x] Owner Dashboard dengan Laporan Bisnis & Recharts
- [x] Manajemen Layanan & Item dengan Upload Foto
- [x] Manajemen Reservasi dengan Update Status & Pembayaran
- [x] Metode Pembayaran (COD / Transfer)
- [x] Deploy ke Production VPS
- [ ] Unit Testing
- [ ] Payment Gateway Integration
- [ ] Email Notifications
- [ ] PWA Support
- [ ] Multi-language Support
- [ ] Dark Mode

## 🤝 Kontributor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/MuhammadRizalNurfirdaus">
        <img src="https://github.com/MuhammadRizalNurfirdaus.png" width="100px;" alt="Muhammad Rizal Nurfirdaus"/><br />
        <sub><b>Muhammad Rizal Nurfirdaus</b></sub>
      </a><br />
      <sub>Developer & Maintainer</sub><br /><br />
      <a href="https://wa.me/6283101461069">
        <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"/>
      </a>
      <a href="https://github.com/MuhammadRizalNurfirdaus">
        <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
      </a>
    </td>
  </tr>
</table>

## 📞 Kontak

Jika ada pertanyaan atau ingin berkolaborasi, hubungi saya:

- 📱 **WhatsApp**: [083101461069](https://wa.me/6283101461069)
- 🐙 **GitHub**: [@MuhammadRizalNurfirdaus](https://github.com/MuhammadRizalNurfirdaus)
- 📧 **Email**: muhammadrizalnurfirdaus@gmail.com

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

## ⚖️ Hak Cipta

```
Copyright (c) 2024-2026 Muhammad Rizal Nurfirdaus

Hak cipta dilindungi undang-undang.
Dilarang memperbanyak, mendistribusikan, atau menggunakan
proyek ini untuk tujuan komersial tanpa izin tertulis dari pemilik.
```

---

<p align="center">
  <b>🗓️ Sistem Reservasi</b><br>
  Made with ❤️ by <a href="https://github.com/MuhammadRizalNurfirdaus">Muhammad Rizal Nurfirdaus</a><br><br>
  <a href="https://github.com/MuhammadRizalNurfirdaus/Sistem-Reservasi.git">⭐ Star this repository</a> jika bermanfaat!
</p>
