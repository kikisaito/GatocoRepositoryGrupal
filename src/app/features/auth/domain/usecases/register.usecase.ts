import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserRequest, AuthResponse } from '../../data/models/user.model';
import { IUserRepository } from '../interfaces/repositories/user.repository.interface';
import { ISecurityService } from '../interfaces/services/security.service.interface';
import { USER_REPOSITORY_TOKEN, SECURITY_SERVICE_TOKEN } from '../interfaces/tokens';

/**
 * RegisterUseCase - Caso de uso para el registro de usuarios
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio del registro
 */
@Injectable({
    providedIn: 'root'
})
export class RegisterUseCase {

    constructor(
        @Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository,
        @Inject(SECURITY_SERVICE_TOKEN) private securityService: ISecurityService
    ) { }

    /**
     * Ejecuta el caso de uso de registro
     * @param userData Datos del usuario a registrar
     * @returns Observable con la respuesta de autenticación
     */
    execute(userData: CreateUserRequest): Observable<AuthResponse> {
        // Validaciones de entrada
        const errors: string[] = [];

        if (!userData.fullName) {
            errors.push('El nombre es requerido');
        }

        if (!userData.email) {
            errors.push('El email es requerido');
        }

        if (!userData.phone) {
            errors.push('El teléfono es requerido');
        }

        if (!userData.password) {
            errors.push('La contraseña es requerida');
        }

        if (errors.length > 0) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: errors.join(', ')
                });
                observer.complete();
            });
        }

        // Validaciones de formato
        const sanitizedName = this.securityService.sanitizeInput(userData.fullName);
        const sanitizedEmail = this.securityService.sanitizeInput(userData.email);
        const sanitizedPhone = this.securityService.sanitizeInput(userData.phone);

        if (!this.securityService.isValidEmail(sanitizedEmail)) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: 'Email inválido'
                });
                observer.complete();
            });
        }

        if (!this.securityService.isValidName(sanitizedName)) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: 'Nombre inválido'
                });
                observer.complete();
            });
        }

        if (!this.securityService.isValidPhone(sanitizedPhone)) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: 'Teléfono inválido'
                });
                observer.complete();
            });
        }

        const passwordValidation = this.securityService.isValidPassword(userData.password);
        if (!passwordValidation.isValid) {
            return new Observable<AuthResponse>(observer => {
                observer.next({
                    success: false,
                    message: passwordValidation.errors.join(', ')
                });
                observer.complete();
            });
        }

        // Ejecutar creación de usuario - solo lógica de negocio
        const sanitizedUserData: CreateUserRequest = {
            fullName: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            password: userData.password, // No sanitizar password
            role: userData.role
        };

        return this.userRepository.createUser(sanitizedUserData);
    }
}
