import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all services
router.get('/', async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            include: {
                items: {
                    where: { isAvailable: true },
                    orderBy: { price: 'asc' }
                },
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Get service by ID with items
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const service = await prisma.service.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    where: { isAvailable: true },
                    orderBy: { price: 'asc' }
                }
            }
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// Get service item by ID
router.get('/items/:id', async (req: Request, res: Response) => {
    try {
        const item = await prisma.serviceItem.findUnique({
            where: { id: req.params.id },
            include: {
                service: true
            }
        });

        if (!item) {
            return res.status(404).json({ error: 'Service item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Error fetching service item:', error);
        res.status(500).json({ error: 'Failed to fetch service item' });
    }
});

// Create service (admin only)
router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // const authReq = req as AuthenticatedRequest; // Not strictly used but kept for consistency if needed
    try {
        const { name, description, imageUrl, icon } = req.body;

        const service = await prisma.service.create({
            data: { name, description, imageUrl, icon }
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// Update service (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        const { name, description, imageUrl, icon } = req.body;

        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: { name, description, imageUrl, icon }
        });

        res.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// Delete service (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        await prisma.service.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// ==================== SERVICE ITEMS CRUD ====================

// Create service item (admin only)
router.post('/:serviceId/items', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        const { name, description, price, duration, imageUrl, isAvailable } = req.body;

        const item = await prisma.serviceItem.create({
            data: {
                serviceId: req.params.serviceId,
                name,
                description,
                price: parseFloat(price),
                duration: duration ? parseInt(duration) : null,
                imageUrl,
                isAvailable: isAvailable !== false
            },
            include: { service: true }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating service item:', error);
        res.status(500).json({ error: 'Failed to create service item' });
    }
});

// Update service item (admin only)
router.put('/items/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        const { name, description, price, duration, imageUrl, isAvailable } = req.body;

        const item = await prisma.serviceItem.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                duration: duration ? parseInt(duration) : null,
                imageUrl,
                isAvailable
            },
            include: { service: true }
        });

        res.json(item);
    } catch (error) {
        console.error('Error updating service item:', error);
        res.status(500).json({ error: 'Failed to update service item' });
    }
});

// Delete service item (admin only)
router.delete('/items/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        await prisma.serviceItem.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Service item deleted successfully' });
    } catch (error) {
        console.error('Error deleting service item:', error);
        res.status(500).json({ error: 'Failed to delete service item' });
    }
});

// Get all items for a service
router.get('/:serviceId/items', async (req: Request, res: Response) => {
    try {
        const items = await prisma.serviceItem.findMany({
            where: { serviceId: req.params.serviceId },
            orderBy: { price: 'asc' }
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching service items:', error);
        res.status(500).json({ error: 'Failed to fetch service items' });
    }
});

export default router;
