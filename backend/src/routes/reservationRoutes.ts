import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get ALL reservations for ADMIN/OWNER
router.get('/admin', isAuthenticated, async (req: Request, res: Response) => {
    try {
        // Check if user is ADMIN or OWNER
        if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
            return res.status(403).json({ error: 'Access denied. Admin or Owner only.' });
        }

        const reservations = await prisma.reservation.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true
                    }
                },
                serviceItem: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching all reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Get user's reservations
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { userId: req.user!.id },
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
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Get single reservation
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const reservation = await prisma.reservation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id
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
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({ error: 'Failed to fetch reservation' });
    }
});

// Create reservation
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { serviceItemId, date, time, guestCount, notes, location, contactPhone, paymentMethod } = req.body;

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
                userId: req.user!.id,
                serviceItemId,
                date: new Date(date),
                time,
                guestCount: guestCount ? parseInt(guestCount) : null,
                notes,
                location,
                contactPhone,
                paymentMethod: paymentMethod || 'COD'
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
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Update reservation (Admin can update any, user only their own)
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {

    try {
        const { date, time, guestCount, notes, status, isPaid, paymentMethod } = req.body;
        const isAdminOrOwner = req.user!.role === 'ADMIN' || req.user!.role === 'OWNER';

        // Check if reservation exists
        let existing;
        if (isAdminOrOwner) {
            // Admin/Owner can update any reservation
            existing = await prisma.reservation.findUnique({
                where: { id: req.params.id }
            });
        } else {
            // Customer can only update their own reservation
            existing = await prisma.reservation.findFirst({
                where: {
                    id: req.params.id,
                    userId: req.user!.id
                }
            });
        }

        if (!existing) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Customer can only update pending reservations
        if (!isAdminOrOwner && existing.status !== 'PENDING') {
            return res.status(400).json({ error: 'Cannot update non-pending reservation' });
        }

        const reservation = await prisma.reservation.update({
            where: { id: req.params.id },
            data: {
                date: date ? new Date(date) : undefined,
                time,
                guestCount: guestCount ? parseInt(guestCount) : undefined,
                notes,
                status,
                isPaid: isPaid !== undefined ? isPaid : undefined,
                paymentMethod: paymentMethod || undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true
                    }
                },
                serviceItem: {
                    include: {
                        service: true
                    }
                }
            }
        });

        res.json(reservation);
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ error: 'Failed to update reservation' });
    }
});

// Cancel reservation
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
        // Check if reservation belongs to user
        const existing = await prisma.reservation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id
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
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});

export default router;
