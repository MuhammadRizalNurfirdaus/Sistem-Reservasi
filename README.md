# 🗓️ Sistem Reservasi

> **⚠️ Status: Dalam Pengembangan (Work in Progress)**

Sistem Reservasi adalah aplikasi web full-stack untuk manajemen reservasi layanan yang dibangun dengan teknologi modern. Aplikasi ini memungkinkan pengguna untuk memesan berbagai layanan dan admin untuk mengelola reservasi serta layanan yang tersedia.

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

### Fitur Pengguna (Customer)
- 🔐 Autentikasi (Register, Login, Google OAuth)
- 📝 Melihat daftar layanan yang tersedia
- 📅 Membuat reservasi layanan
- 📊 Melihat riwayat reservasi
- 👤 Mengelola profil pengguna

### Fitur Admin
- 📈 Dashboard statistik reservasi
- 🛠️ Manajemen layanan (CRUD)
- 📋 Manajemen reservasi (Approve, Reject, Complete)
- 👥 Melihat data pengguna

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

### Prasyarat
- Node.js (v18 atau lebih baru)
- PostgreSQL
- npm atau yarn

### Langkah Instalasi

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

## 🤝 Kontributor

- **Muhammad Rizal Nurfirdaus** - *Developer* - [GitHub](https://github.com/MuhammadRizalNurfirdaus)

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

## 🔮 Roadmap

- [ ] Unit Testing
- [ ] Payment Integration
- [ ] Email Notifications
- [ ] PWA Support
- [ ] Multi-language Support
- [ ] Dark Mode

---

<p align="center">
  Made with ❤️ by Muhammad Rizal Nurfirdaus
</p>
