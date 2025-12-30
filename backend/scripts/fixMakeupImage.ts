import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Fixing Makeup Graduation image...');

    try {
        const item = await prisma.serviceItem.updateMany({
            where: {
                name: {
                    contains: 'Makeup Graduation',
                    mode: 'insensitive'
                }
            },
            data: {
                imageUrl: 'https://images.unsplash.com/photo-1620331309609-80c2a2729467?q=80&w=1000&auto=format&fit=crop'
            }
        });

        console.log(`✅ Updated ${item.count} items.`);
    } catch (error) {
        console.error('❌ Error updating image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
