import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SecurityService {

    /**
     * Valida formato de email
     */
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida fortaleza de contraseña
     */
    isValidPassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra mayúscula');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra minúscula');
        }

        if (!/\d/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('La contraseña debe contener al menos un carácter especial');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida formato de teléfono
     */
    isValidPhone(phone: string): boolean {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    /**
     * Sanitiza entrada de texto
     */
    sanitizeInput(input: string): string {
        return input.trim().replace(/[<>]/g, '');
    }

    /**
     * Valida que el nombre no contenga caracteres especiales
     */
    isValidName(name: string): boolean {
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return nameRegex.test(name) && name.trim().length >= 2;
    }

    /**
     * Genera un hash simple para contraseñas (en producción usar bcrypt)
     */
    simpleHash(password: string): string {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    /**
     * Valida token JWT (placeholder para implementación real)
     */
    isValidToken(token: string): boolean {
        // En producción, validar JWT real
        return Boolean(token && token.length > 0);
    }

    /**
     * Genera token de sesión simple (en producción usar JWT)
     */
    generateSessionToken(userId: number): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `${userId}_${timestamp}_${random}`;
    }
}
