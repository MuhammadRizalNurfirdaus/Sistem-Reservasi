import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Fixing Makeup Graduation image (Final Take)...');

    try {
        const item = await prisma.serviceItem.findFirst({
            where: {
                name: {
                    contains: 'Makeup Graduation',
                    mode: 'insensitive'
                }
            }
        });

        if (item) {
            console.log('Found item:', item.name);

            await prisma.serviceItem.update({
                where: { id: item.id },
                data: {
                    imageUrl: 'https://images.unsplash.com/photo-1680733026158-046eb22c9fae?q=80&w=800&auto=format&fit=crop'
                }
            });

            console.log('✅ Updated with user-selected image.');
        } else {
            console.log('❌ Item not found!');
        }

    } catch (error) {
        console.error('❌ Error updating image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
