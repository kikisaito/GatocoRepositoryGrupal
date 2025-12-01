import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, CreateUserRequest, AuthResponse } from '../models/user.model';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { ISecurityService } from '../../domain/interfaces/services/security.service.interface';
import { SECURITY_SERVICE_TOKEN } from '../../domain/interfaces/tokens';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { UserInContext } from '../../../../core/utils/authcontext';

@Injectable({
    providedIn: 'root'
})
export class UserRepository implements IUserRepository {
    constructor(
        @Inject(SECURITY_SERVICE_TOKEN) private securityService: ISecurityService,
        private authApiService: AuthApiService
    ) { }

    // Este método ahora es síncrono para mantener compatibilidad, pero internamente prepara la llamada
    findByEmailAndPassword(email: string, password: string): Observable<AuthResponse> {
        // Repository solo traduce datos, no valida
        return this.authApiService.login(email, password).pipe(
            map((response: any): AuthResponse => {
                // El login devuelve el usuario y token
                if (response.success && response.user && response.token) {
                    // Almacenar token en localStorage
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('authToken', response.token);
                    }
                    return {
                        success: true,
                        user: response.user,
                        token: response.token,
                        message: response.message || 'Login exitoso'
                    };
                }
                return {
                    success: response.success,
                    message: response.message || 'Error al iniciar sesión'
                };
            }),
            catchError(error => {
                // Extraer el mensaje del error HTTP
                let errorMessage = 'Error al iniciar sesión';

                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                }

                // Retornar un Observable<AuthResponse> con el mensaje de error
                return new Observable<AuthResponse>(observer => {
                    observer.next({
                        success: false,
                        message: errorMessage
                    });
                    observer.complete();
                });
            })
        );
    }

    findById(id: number): Observable<UserInContext | null> {
        // Para este método, necesitaríamos un endpoint en la API
        // Por ahora retornamos un observable que resuelve con null
        return new Observable<UserInContext | null>(observer => {
            observer.next(null);
            observer.complete();
        });
    }

    findByEmail(email: string): Observable<UserInContext | null> {
        // Repository solo traduce datos, no valida
        // Validar con la API que el email no existe
        return this.authApiService.getCurrentUser().pipe(
            map(response => {
                // Esto es una simplificación, idealmente necesitaríamos un endpoint específico
                return null;
            })
        );
    }

    createUser(userData: CreateUserRequest): Observable<AuthResponse> {
        // Repository solo traduce datos, sin validaciones
        return this.authApiService.register(userData).pipe(
            map((response: any): AuthResponse => {
                if (response.success && response.token) {
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('authToken', response.token);
                    }
                }
                return {
                    success: response.success,
                    user: response.user,
                    token: response.token,
                    message: response.message || 'Usuario creado exitosamente'
                };
            })
        );
    }

    updateLastLogin(userId: number): void {
        // Este método ahora es una operación que la API maneja automáticamente
        // No necesitamos implementarlo aquí
    }

    deactivateUser(userId: number): Observable<boolean> {
        // Este método se implementaría con un endpoint DELETE en la API
        return new Observable<boolean>(observer => {
            observer.next(true);
            observer.complete();
        });
    }

    getAllUsers(): Observable<UserInContext[]> {
        // Este método se implementaría con un endpoint GET en la API
        return new Observable<UserInContext[]>(observer => {
            observer.next([]);
            observer.complete();
        });
    }
}
