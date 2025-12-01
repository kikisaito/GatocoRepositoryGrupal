export interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    password: string; // En producción debería ser hasheada
    role: 'veterinario' | 'cliente';
    createdAt: Date;
    lastLogin?: Date;
    isActive: boolean;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'veterinario' | 'cliente';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: Omit<User, 'password'>; // No exponer password
    token?: string;
    message: string;
}
