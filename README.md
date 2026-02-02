# 🗓️ Sistem Reservasi

> **⚠️ Status: Dalam Pengembangan (Work in Progress)**
> 
> Proyek ini masih dalam tahap pengembangan aktif. Beberapa fitur mungkin belum sepenuhnya berfungsi atau dapat berubah sewaktu-waktu.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/MuhammadRizalNurfirdaus/Sistem-Reservasi.git)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)]()

Sistem Reservasi adalah aplikasi web full-stack untuk manajemen reservasi layanan yang dibangun dengan teknologi modern. Aplikasi ini memungkinkan pengguna untuk memesan berbagai layanan, pemilik bisnis untuk memantau performa, dan admin untuk mengelola seluruh sistem.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Kontributor](#-kontributor)

## ✨ Fitur

### 👤 Fitur Customer
- 🔐 Autentikasi (Register, Login, Google OAuth)
- 📝 Melihat daftar layanan yang tersedia
- 📅 Membuat reservasi layanan
- 📊 Dashboard dengan riwayat reservasi
- 👤 Mengelola profil dengan alamat lengkap (Provinsi → Kota → Kecamatan → Desa)

### 👔 Fitur Owner (Pemilik Bisnis)
- 📈 Dashboard laporan bisnis
- 💰 Laporan pendapatan dengan grafik
- 📊 Statistik reservasi harian/bulanan
- 📋 Monitoring performa layanan

### 🔧 Fitur Admin
- 📈 Dashboard statistik lengkap
- 🛠️ Manajemen layanan & item (CRUD dengan foto)
- 📋 Manajemen reservasi (Approve, Reject, Complete)
- 👥 Manajemen pengguna

## 🛠️ Tech Stack

### Backend
| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| Node.js | - | Runtime JavaScript |
| Express.js | ^4.18.2 | Web Framework |
| TypeScript | ^5.3.3 | Bahasa Pemrograman |
| Prisma | ^6.1.0 | ORM Database |
| PostgreSQL | - | Database |
| Passport.js | ^0.7.0 | Autentikasi |
| bcrypt | ^6.0.0 | Hashing Password |

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
| avatar | String? | URL avatar |
| role | Role | CUSTOMER / ADMIN |

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

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Register user baru |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/google/callback` | Google OAuth callback |

### Services
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/services` | Get semua layanan |
| GET | `/api/services/:id` | Get detail layanan |
| POST | `/api/services` | Buat layanan baru (Admin) |
| PUT | `/api/services/:id` | Update layanan (Admin) |
| DELETE | `/api/services/:id` | Hapus layanan (Admin) |

### Reservations
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/reservations` | Get reservasi user |
| GET | `/api/reservations/all` | Get semua reservasi (Admin) |
| POST | `/api/reservations` | Buat reservasi baru |
| PUT | `/api/reservations/:id/status` | Update status (Admin) |
| DELETE | `/api/reservations/:id` | Hapus reservasi |

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
- [x] Owner Dashboard dengan Laporan Bisnis
- [x] Manajemen Layanan & Item dengan Foto
- [ ] Unit Testing
- [ ] Payment Integration
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
