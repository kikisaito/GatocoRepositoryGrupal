import { InjectionToken } from '@angular/core';
import { IUserRepository } from './repositories/user.repository.interface';
import { ISecurityService } from './services/security.service.interface';

/**
 * Token de inyección para IUserRepository
 * Se usa en providers para mapear la interfaz con su implementación
 */
export const USER_REPOSITORY_TOKEN = new InjectionToken<IUserRepository>('IUserRepository');

/**
 * Token de inyección para ISecurityService
 * Se usa en providers para mapear la interfaz con su implementación
 */
export const SECURITY_SERVICE_TOKEN = new InjectionToken<ISecurityService>('ISecurityService');
