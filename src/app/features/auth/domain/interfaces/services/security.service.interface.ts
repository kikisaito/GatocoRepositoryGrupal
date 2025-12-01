/**
 * Interfaz para el servicio de seguridad
 * Define el contrato que debe cumplir cualquier implementación de servicio de seguridad
 */
export interface ISecurityService {
    /**
     * Valida el formato de email
     * @param email Email a validar
     * @returns true si el email es válido
     */
    isValidEmail(email: string): boolean;

    /**
     * Valida la fortaleza de la contraseña
     * @param password Contraseña a validar
     * @returns Objeto con el resultado de la validación
     */
    isValidPassword(password: string): { isValid: boolean; errors: string[] };

    /**
     * Valida el formato de teléfono
     * @param phone Teléfono a validar
     * @returns true si el teléfono es válido
     */
    isValidPhone(phone: string): boolean;

    /**
     * Sanitiza la entrada de texto
     * @param input Texto a sanitizar
     * @returns Texto sanitizado
     */
    sanitizeInput(input: string): string;

    /**
     * Valida que el nombre no contenga caracteres especiales
     * @param name Nombre a validar
     * @returns true si el nombre es válido
     */
    isValidName(name: string): boolean;

    /**
     * Genera un hash simple para contraseñas
     * @param password Contraseña a hashear
     * @returns Hash de la contraseña
     */
    simpleHash(password: string): string;

    /**
     * Valida un token JWT
     * @param token Token a validar
     * @returns true si el token es válido
     */
    isValidToken(token: string): boolean;

    /**
     * Genera un token de sesión
     * @param userId ID del usuario
     * @returns Token de sesión
     */
    generateSessionToken(userId: number): string;
}
