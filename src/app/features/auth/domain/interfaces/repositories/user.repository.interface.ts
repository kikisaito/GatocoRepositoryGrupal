import { Observable } from 'rxjs';
import { User, CreateUserRequest, AuthResponse } from '../../../data/models/user.model';
import { UserInContext } from '../../../../../core/utils/authcontext';

/**
 * Interfaz para el repositorio de usuarios
 * Define el contrato que debe cumplir cualquier implementación de repositorio
 */
export interface IUserRepository {
    /**
     * Busca un usuario por email y contraseña
     * @param email Email del usuario
     * @param password Contraseña del usuario
     * @returns Observable con la respuesta de autenticación
     */
    findByEmailAndPassword(email: string, password: string): Observable<AuthResponse>;

    /**
     * Busca un usuario por ID
     * @param id ID del usuario
     * @returns Observable con el usuario encontrado o null
     */
    findById(id: number): Observable<UserInContext | null>;

    /**
     * Busca un usuario por email
     * @param email Email del usuario
     * @returns Observable con el usuario encontrado o null
     */
    findByEmail(email: string): Observable<UserInContext | null>;

    /**
     * Crea un nuevo usuario
     * @param userData Datos del usuario a crear
     * @returns Observable con la respuesta de autenticación
     */
    createUser(userData: CreateUserRequest): Observable<AuthResponse>;

    /**
     * Actualiza el último login del usuario
     * @param userId ID del usuario
     */
    updateLastLogin(userId: number): void;

    /**
     * Desactiva un usuario
     * @param userId ID del usuario
     * @returns Observable con el resultado
     */
    deactivateUser(userId: number): Observable<boolean>;

    /**
     * Obtiene todos los usuarios
     * @returns Observable con la lista de usuarios
     */
    getAllUsers(): Observable<UserInContext[]>;
}
