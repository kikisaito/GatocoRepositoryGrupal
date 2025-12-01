import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../data/models/user.model';
import { IUserRepository } from '../interfaces/repositories/user.repository.interface';
import { ISecurityService } from '../interfaces/services/security.service.interface';
import { USER_REPOSITORY_TOKEN, SECURITY_SERVICE_TOKEN } from '../interfaces/tokens';

/**
 * LoginUseCase - Caso de uso para el login de usuarios
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio del login
 */
@Injectable({
    providedIn: 'root'
})
export class LoginUseCase {

    constructor(
        @Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository,
        @Inject(SECURITY_SERVICE_TOKEN) private securityService: ISecurityService
    ) { }

    /**
     * Ejecuta el caso de uso de login
     * @param email Email del usuario
     * @param password Contraseña del usuario
     * @returns Observable con la respuesta de autenticación
     */
    execute(email: string, password: string): Observable<AuthResponse> {
        // Validaciones de entrada
        if (!email || !password) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
                observer.complete();
            });
        }

        // Sanitizar entrada
        const sanitizedEmail = this.securityService.sanitizeInput(email);

        // Validar formato de email
        if (!this.securityService.isValidEmail(sanitizedEmail)) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: 'Formato de email inválido'
                });
                observer.complete();
            });
        }

        // Ejecutar búsqueda de usuario - solo lógica de negocio
        return this.userRepository.findByEmailAndPassword(sanitizedEmail, password);
    }
}
