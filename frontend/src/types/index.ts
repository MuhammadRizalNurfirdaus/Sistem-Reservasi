// User type
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    avatar?: string | null;
    role: 'CUSTOMER' | 'ADMIN' | 'OWNER';
}

// Service type
export interface Service {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    icon?: string | null;
    items: ServiceItem[];
    _count?: {
        items: number;
    };
    createdAt: string;
}

// Service Item type
export interface ServiceItem {
    id: string;
    serviceId: string;
    service?: Service;
    name: string;
    description?: string | null;
    price: number | string;
    duration?: number | null;
    imageUrl?: string | null;
    isAvailable: boolean;
}

// Reservation type
export interface Reservation {
    id: string;
    userId: string;
    serviceItemId: string;
    serviceItem: ServiceItem & { service: Service };
    date: string;
    time: string;
    guestCount?: number | null;
    notes?: string | null;
    location?: string | null;
    contactPhone?: string | null;
    paymentMethod?: 'COD' | 'TRANSFER' | 'EWALLET';
    isPaid?: boolean;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    user: User; // Include user relation
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface AuthResponse {
    user: User | null;
}

export interface ApiError {
    error: string;
}
