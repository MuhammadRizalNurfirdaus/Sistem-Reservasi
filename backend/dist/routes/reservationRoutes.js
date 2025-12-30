"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get user's reservations
router.get('/', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { userId: req.user.id },
            include: {
                serviceItem: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(reservations);
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});
// Get single reservation
router.get('/:id', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        const reservation = await prisma.reservation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                serviceItem: {
                    include: {
                        service: true
                    }
                }
            }
        });
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    }
    catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({ error: 'Failed to fetch reservation' });
    }
});
// Create reservation
router.post('/', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        const { serviceItemId, date, time, guestCount, notes, location, contactPhone } = req.body;
        // Validate service item exists
        const serviceItem = await prisma.serviceItem.findUnique({
            where: { id: serviceItemId }
        });
        if (!serviceItem) {
            return res.status(400).json({ error: 'Invalid service item' });
        }
        if (!serviceItem.isAvailable) {
            return res.status(400).json({ error: 'Service item is not available' });
        }
        const reservation = await prisma.reservation.create({
            data: {
                userId: req.user.id,
                serviceItemId,
                date: new Date(date),
                time,
                guestCount: guestCount ? parseInt(guestCount) : null,
                notes,
                location,
                contactPhone
            },
            include: {
                serviceItem: {
                    include: {
                        service: true
                    }
                }
            }
        });
        res.status(201).json(reservation);
    }
    catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});
// Update reservation
router.put('/:id', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        const { date, time, guestCount, notes, status } = req.body;
        // Check if reservation belongs to user
        const existing = await prisma.reservation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        // Only allow updates for pending reservations
        if (existing.status !== 'PENDING' && !req.user.role) {
            return res.status(400).json({ error: 'Cannot update non-pending reservation' });
        }
        const reservation = await prisma.reservation.update({
            where: { id: req.params.id },
            data: {
                date: date ? new Date(date) : undefined,
                time,
                guestCount: guestCount ? parseInt(guestCount) : undefined,
                notes,
                status
            },
            include: {
                serviceItem: {
                    include: {
                        service: true
                    }
                }
            }
        });
        res.json(reservation);
    }
    catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ error: 'Failed to update reservation' });
    }
});
// Cancel reservation
router.delete('/:id', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        // Check if reservation belongs to user
        const existing = await prisma.reservation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        // Soft delete - change status to cancelled
        const reservation = await prisma.reservation.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED' }
        });
        res.json({ message: 'Reservation cancelled', reservation });
    }
    catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});
exports.default = router;
//# sourceMappingURL=reservationRoutes.js.map