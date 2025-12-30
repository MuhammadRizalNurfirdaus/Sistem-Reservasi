import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Services
    const salonService = await prisma.service.upsert({
        where: { name: 'Salon' },
        update: {},
        create: {
            name: 'Salon',
            description: 'Layanan perawatan rambut dan kecantikan profesional',
            icon: '💇',
            imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
            items: {
                create: [
                    {
                        name: 'Potong Rambut Pria',
                        description: 'Potong rambut modern dengan teknik terkini',
                        price: 50000,
                        duration: 30,
                        imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'
                    },
                    {
                        name: 'Potong Rambut Wanita',
                        description: 'Potong rambut wanita dengan styling',
                        price: 75000,
                        duration: 45,
                        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
                    },
                    {
                        name: 'Hair Coloring',
                        description: 'Pewarnaan rambut dengan produk premium',
                        price: 250000,
                        duration: 120,
                        imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400'
                    },
                    {
                        name: 'Hair Treatment',
                        description: 'Perawatan rambut intensif untuk rambut sehat',
                        price: 150000,
                        duration: 60,
                        imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400'
                    },
                    {
                        name: 'Creambath & Massage',
                        description: 'Perawatan rambut dengan pijat kepala relaksasi',
                        price: 100000,
                        duration: 45,
                        imageUrl: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400'
                    }
                ]
            }
        }
    });

    const prasmananService = await prisma.service.upsert({
        where: { name: 'Prasmanan' },
        update: {},
        create: {
            name: 'Prasmanan',
            description: 'Layanan catering prasmanan untuk berbagai acara',
            icon: '🍽️',
            imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
            items: {
                create: [
                    {
                        name: 'Paket Standar',
                        description: '5 menu utama + 2 dessert + minuman (min. 50 pax)',
                        price: 75000,
                        duration: 240,
                        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
                    },
                    {
                        name: 'Paket Premium',
                        description: '8 menu utama + 3 dessert + live cooking (min. 100 pax)',
                        price: 125000,
                        duration: 300,
                        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
                    },
                    {
                        name: 'Paket Wedding',
                        description: '10 menu + dessert corner + ice cream bar (min. 200 pax)',
                        price: 175000,
                        duration: 360,
                        imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
                    },
                    {
                        name: 'Paket Corporate',
                        description: '6 menu meeting + coffee break (min. 30 pax)',
                        price: 85000,
                        duration: 180,
                        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'
                    },
                    {
                        name: 'Paket Aqiqah',
                        description: 'Menu spesial aqiqah + nasi box (min. 100 box)',
                        price: 45000,
                        duration: 120,
                        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'
                    }
                ]
            }
        }
    });

    const riasanService = await prisma.service.upsert({
        where: { name: 'Riasan' },
        update: {},
        create: {
            name: 'Riasan',
            description: 'Layanan makeup profesional untuk segala acara',
            icon: '💄',
            imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
            items: {
                create: [
                    {
                        name: 'Makeup Natural',
                        description: 'Riasan natural untuk tampilan sehari-hari',
                        price: 150000,
                        duration: 60,
                        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'
                    },
                    {
                        name: 'Makeup Party',
                        description: 'Riasan glamour untuk pesta dan acara formal',
                        price: 250000,
                        duration: 90,
                        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
                    },
                    {
                        name: 'Makeup Wedding',
                        description: 'Paket makeup pengantin lengkap dengan hijab/hairdo',
                        price: 2500000,
                        duration: 180,
                        imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400'
                    },
                    {
                        name: 'Makeup Graduation',
                        description: 'Riasan wisuda yang elegan dan tahan lama',
                        price: 200000,
                        duration: 75,
                        imageUrl: 'https://images.unsplash.com/photo-1607017181587-6b1b2e9d14c3?w=400'
                    },
                    {
                        name: 'Makeup Pre-Wedding',
                        description: 'Riasan untuk sesi foto pre-wedding',
                        price: 500000,
                        duration: 120,
                        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'
                    }
                ]
            }
        }
    });

    console.log('✅ Created services:', {
        salon: salonService.name,
        prasmanan: prasmananService.name,
        riasan: riasanService.name
    });

    // Create Admin
    const adminEmail = 'admin12345@gmail.com';
    const hashedPassword = await bcrypt.hash('admin12345', 10); // Updated to admin12345

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword // Force update password if exists
        },
        create: {
            email: adminEmail,
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN',
            googleId: null
        }
    });
    console.log('✅ Created admin:', admin.email);

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
