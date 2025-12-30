import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Fixing Makeup Graduation image (User Choice)...');

    // User selected: https://unsplash.com/id/foto/seorang-pria-dan-wanita-mengenakan-gaun-dan-topi-kelulusan-fJTFIrvXCDo
    const NEW_IMAGE_URL = 'https://images.unsplash.com/photo-1659080927204-de39f5fdfb02?q=80&w=1000&auto=format&fit=crop';

    try {
        const item = await prisma.serviceItem.updateMany({
            where: {
                name: {
                    contains: 'Makeup Graduation',
                    mode: 'insensitive'
                }
            },
            data: {
                imageUrl: NEW_IMAGE_URL
            }
        });

        console.log(`✅ Updated ${item.count} items with new image.`);
        console.log(`URL: ${NEW_IMAGE_URL}`);

    } catch (error) {
        console.error('❌ Error updating image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
