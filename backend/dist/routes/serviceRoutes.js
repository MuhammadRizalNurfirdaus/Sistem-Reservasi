"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all services
router.get('/', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Get service by ID with items
router.get('/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});
// Get service item by ID
router.get('/items/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching service item:', error);
        res.status(500).json({ error: 'Failed to fetch service item' });
    }
});
// Create service (admin only)
router.post('/', auth_js_1.isAuthenticated, auth_js_1.isAdmin, async (req, res) => {
    // const authReq = req as AuthenticatedRequest; // Not strictly used but kept for consistency if needed
    try {
        const { name, description, imageUrl, icon } = req.body;
        const service = await prisma.service.create({
            data: { name, description, imageUrl, icon }
        });
        res.status(201).json(service);
    }
    catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});
// Update service (admin only)
router.put('/:id', auth_js_1.isAuthenticated, auth_js_1.isAdmin, async (req, res) => {
    try {
        const { name, description, imageUrl, icon } = req.body;
        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: { name, description, imageUrl, icon }
        });
        res.json(service);
    }
    catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});
// Delete service (admin only)
router.delete('/:id', auth_js_1.isAuthenticated, auth_js_1.isAdmin, async (req, res) => {
    try {
        await prisma.service.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});
exports.default = router;
//# sourceMappingURL=serviceRoutes.js.map