const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Generic fetch wrapper with credentials
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const isFormData = options?.body instanceof FormData;
    const headers = {
        ...options?.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
            console.error('Failed to parse error response:', e);
            errorMessage = await response.text();
            // Fallback if text is empty or too long HTML
            if (!errorMessage || errorMessage.startsWith('<')) {
                errorMessage = `Request failed with status ${response.status}`;
            }
        }
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
    }

    return response.json();
}

// Auth API
export const authApi = {
    getMe: () => fetchApi<{ user: import('../types').User | null }>('/auth/me'),
    logout: () => fetchApi<{ message: string }>('/auth/logout', { method: 'POST' }),
    login: (data: any) => fetchApi<{ user: import('../types').User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => fetchApi<{ user: import('../types').User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    updateProfile: (data: FormData) => fetchApi<{ user: import('../types').User }>('/auth/me', {
        method: 'PUT',
        body: data,
        // When sending FormData, do not set Content-Type header manually
        // fetchApi will need to handle this or we override headers
        headers: {}
    }),
    getGoogleLoginUrl: () => `${API_URL}/auth/google`,
};

// Services API
export const servicesApi = {
    getAll: () => fetchApi<import('../types').Service[]>('/api/services'),
    getById: (id: string) => fetchApi<import('../types').Service>(`/api/services/${id}`),
    getItem: (id: string) => fetchApi<import('../types').ServiceItem>(`/api/services/items/${id}`),
    create: (data: Partial<import('../types').Service>) => fetchApi<import('../types').Service>('/api/services', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<import('../types').Service>) => fetchApi<import('../types').Service>(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi<{ message: string }>(`/api/services/${id}`, {
        method: 'DELETE',
    }),
};

// Reservations API
export const reservationsApi = {
    getAll: () => fetchApi<import('../types').Reservation[]>('/api/reservations'),
    getById: (id: string) => fetchApi<import('../types').Reservation>(`/api/reservations/${id}`),
    create: (data: {
        serviceItemId: string;
        date: string;
        time: string;
        guestCount?: number;
        notes?: string;
        location?: string;
        contactPhone?: string;
    }) => fetchApi<import('../types').Reservation>('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<{
        date: string;
        time: string;
        guestCount: number;
        notes: string;
        status: string;
    }>) => fetchApi<import('../types').Reservation>(`/api/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    cancel: (id: string) => fetchApi<{ message: string; reservation: import('../types').Reservation }>(`/api/reservations/${id}`, {
        method: 'DELETE',
    }),
};

export { API_URL };
