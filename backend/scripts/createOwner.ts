import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createOwner() {
    const email = 'owner@reservasi.com';
    const password = 'ownerRizal123';
    const name = 'Owner Reservasi';

    try {
        // Check if owner already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            // Update existing user to OWNER role
            const updated = await prisma.user.update({
                where: { email },
                data: {
                    role: 'OWNER',
                    password: await bcrypt.hash(password, 10)
                }
            });
            console.log('✅ Owner user updated:', updated.email);
        } else {
            // Create new owner user
            const hashedPassword = await bcrypt.hash(password, 10);
            const owner = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'OWNER',
                    phone: '081234567890'
                }
            });
            console.log('✅ Owner user created:', owner.email);
        }

        console.log('\n📋 Owner Login Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Role: OWNER\n');

    } catch (error) {
        console.error('❌ Error creating owner:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createOwner();
