import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejar errores HTTP de forma centralizada
 * Redirige a login si el error es 401 (No autorizado)
 * Maneja otros errores de forma consistente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error) => {
            console.error('HTTP Error:', error);

            // Si es una petición de login o registro, NO hacer nada especial
            // Dejar que el componente maneje el error
            const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

            // Si el error es 401 (No autorizado) y NO es una petición de auth
            if (error.status === 401 && !isAuthRequest) {
                // Solo redirigir si NO estamos en la página de login
                const currentUrl = router.url;
                if (currentUrl !== '/login' && currentUrl !== '/register') {
                    console.log('Usuario no autorizado, redirigiendo a login...');

                    // Limpiar datos de autenticación
                    if (typeof localStorage !== 'undefined') {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('currentUser');
                    }

                    // Redirigir a login
                    router.navigate(['/login']);
                }
            }

            // Si el error es 403 (Prohibido)
            if (error.status === 403) {
                console.log('Acceso prohibido');
                // Aquí podrías mostrar un mensaje al usuario
            }

            // Si el error es 500 (Error del servidor)
            if (error.status === 500) {
                console.log('Error en el servidor');
                // Aquí podrías mostrar un mensaje al usuario
            }

            // Re-lanzar el error para que los componentes puedan manejarlo
            // Esto es importante para que los mensajes de error lleguen al componente
            return throwError(() => error);
        })
    );
};
