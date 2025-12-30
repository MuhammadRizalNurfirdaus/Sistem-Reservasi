import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Fixing Makeup Graduation image (Take 2)...');

    try {
        // Find the item first to confirm it exists
        const existing = await prisma.serviceItem.findFirst({
            where: {
                name: {
                    contains: 'Makeup Graduation',
                    mode: 'insensitive'
                }
            }
        });

        if (existing) {
            console.log('Found item:', existing.name, 'Current URL:', existing.imageUrl);

            // Update with a new, safer URL (Makeup brushes/palette)
            const item = await prisma.serviceItem.update({
                where: { id: existing.id },
                data: {
                    // Using a high-quality makeup image that is definitely public
                    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'
                }
            });

            console.log(`✅ Updated item: ${item.name}`);
            console.log(`New URL: ${item.imageUrl}`);
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
