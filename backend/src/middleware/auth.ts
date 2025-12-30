import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please login first.' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && req.user.role === 'ADMIN') {
        return next();
    }
    res.status(403).json({ error: 'Forbidden. Admin access required.' });
};
