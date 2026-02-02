import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateAllImages() {
    console.log('📷 Updating all missing images...');
    
    // Get all items
    const items = await prisma.serviceItem.findMany({
        include: { service: true }
    });
    
    const imageMap: Record<string, string> = {
        // Prasmanan
        'Paket Arisan': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
        'Paket Standar': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        'Paket Premium': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        'Paket Aqiqah': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
        'Paket VIP': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        'Paket Wedding': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
        'Paket Corporate': 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=400',
        
        // Riasan/Makeup
        'Makeup Natural': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        'Makeup Wisuda': 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400',
        'Makeup Pesta': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
        'Makeup Photoshoot': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
        'Bridal Makeup': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400',
        'Makeup Party': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
        'Makeup Wedding': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        'Makeup Graduation': 'https://images.unsplash.com/photo-1607017181587-6b1b2e9d14c3?w=400',
        'Makeup Pre-Wedding': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
        
        // Salon
        'Blow Dry': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
        'Potong Rambut': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
        'Potong Rambut Pria': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
        'Potong Rambut Wanita': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
        'Creambath': 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400',
        'Hair Treatment': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
        'Hair Coloring': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
        'Creambath & Massage': 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400'
    };
    
    for (const item of items) {
        const hasImage = item.imageUrl && !item.imageUrl.includes('placeholder');
        if (!hasImage) {
            const newUrl = imageMap[item.name];
            if (newUrl) {
                await prisma.serviceItem.update({
                    where: { id: item.id },
                    data: { imageUrl: newUrl }
                });
                console.log('✅ Updated:', item.name);
            } else {
                // Default based on category
                let defaultUrl = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400';
                if (item.service.name === 'Prasmanan') {
                    defaultUrl = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400';
                } else if (item.service.name === 'Riasan') {
                    defaultUrl = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400';
                }
                await prisma.serviceItem.update({
                    where: { id: item.id },
                    data: { imageUrl: defaultUrl }
                });
                console.log('✅ Updated with default:', item.name);
            }
        }
    }
    
    console.log('🎉 All images updated!');
}

updateAllImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
