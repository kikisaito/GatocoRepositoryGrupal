/**
 * Utilidad para manejar localStorage de forma segura en SSR
 */
export class StorageUtil {
    static getItem(key: string): string | null {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return null;
        }
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static setItem(key: string, value: string): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }

    static removeItem(key: string): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
}
