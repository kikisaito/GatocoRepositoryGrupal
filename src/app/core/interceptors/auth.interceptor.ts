import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para añadir el token de autenticación a las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Obtener el token del localStorage de forma segura
    let token: string | null = null;

    if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('authToken');
    }

    // Si hay un token, añadirlo como header
    if (token) {
        // El token ya viene en el formato correcto del backend
        // La API espera el token directamente en el header Authorization
        req = req.clone({
            setHeaders: {
                Authorization: token
            }
        });
    }

    return next(req);
};
