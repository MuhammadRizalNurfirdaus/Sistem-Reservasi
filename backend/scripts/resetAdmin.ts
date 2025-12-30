import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Resetting admin password...');
    const email = 'admin12345@gmail.com';
    const password = 'admin12345';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log('✅ Password updated for:', user.email);
    } catch (error) {
        console.log('⚠️ User not found, creating new admin...');
        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    name: 'Admin',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });
            console.log('✅ Admin created:', user.email);
        } catch (createError) {
            console.error('❌ Failed to create/update admin:', createError);
        }
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
