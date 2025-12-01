import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { RegisterUseCase } from '../../domain/usecases/register.usecase';
import { AuthContext } from '../../../../core/utils/authcontext';
import { CreateUserRequest } from '../../data/models/user.model';

export interface RegisterFormState {
    fullName: string;
    email: string;
    phone: string;
    role: 'cliente' | 'veterinario' | '';
    password: string;
    confirmPassword: string;
    isLoading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class RegisterViewModel {
    private registerUseCase = inject(RegisterUseCase);
    private authContext = inject(AuthContext);

    // Signal privado para el estado del formulario
    private _formState = signal<RegisterFormState>({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        confirmPassword: '',
        isLoading: false,
        error: null
    });

    // Signals calculados para valores individuales
    fullName = computed(() => this._formState().fullName);
    email = computed(() => this._formState().email);
    phone = computed(() => this._formState().phone);
    role = computed(() => this._formState().role);
    password = computed(() => this._formState().password);
    confirmPassword = computed(() => this._formState().confirmPassword);
    isLoading = computed(() => this._formState().isLoading);
    error = computed(() => this._formState().error);

    // Estado completo como readonly para acceso externo
    formState = this._formState.asReadonly();

    constructor() {
        // Effect para logging (opcional - para debugging)
        effect(() => {
            const state = this._formState();
            console.log('RegisterViewModel state changed:', {
                email: state.email,
                isLoading: state.isLoading,
                hasError: !!state.error
            });
        });
    }

    updateFullName(fullName: string): void {
        this._formState.update(state => ({ ...state, fullName }));
    }

    updateEmail(email: string): void {
        this._formState.update(state => ({ ...state, email }));
    }

    updatePhone(phone: string): void {
        this._formState.update(state => ({ ...state, phone }));
    }

    updateRole(role: 'cliente' | 'veterinario' | ''): void {
        this._formState.update(state => ({ ...state, role }));
    }

    updatePassword(password: string): void {
        this._formState.update(state => ({ ...state, password }));
    }

    updateConfirmPassword(confirmPassword: string): void {
        this._formState.update(state => ({ ...state, confirmPassword }));
    }

    register(): Promise<{ success: boolean; message: string }> {
        const currentState = this._formState();

        this._formState.update(state => ({ ...state, isLoading: true, error: null }));

        // Validación de tipo de usuario
        const roleValue: string = currentState.role as string;
        if (!roleValue || roleValue.trim() === '') {
            const errorMessage = 'El tipo de usuario es obligatorio';
            this._formState.update(state => ({ ...state, isLoading: false, error: errorMessage }));
            return Promise.resolve({ success: false, message: errorMessage });
        }

        // Validación de contraseñas
        if (currentState.password !== currentState.confirmPassword) {
            const errorMessage = 'Las contraseñas no coinciden';
            this._formState.update(state => ({ ...state, isLoading: false, error: errorMessage }));
            return Promise.resolve({ success: false, message: errorMessage });
        }

        const userData: CreateUserRequest = {
            fullName: currentState.fullName,
            email: currentState.email,
            phone: currentState.phone,
            password: currentState.password,
            role: currentState.role as 'cliente' | 'veterinario' // Ya validado que no está vacío
        };

        return new Promise((resolve, reject) => {
            this.registerUseCase.execute(userData).subscribe({
                next: (result) => {
                    if (result.success && result.user) {
                        // Establecer usuario en contexto
                        this.authContext.setCurrentUser(result.user);
                        this._formState.update(state => ({ ...state, isLoading: false, error: null }));
                        resolve({ success: true, message: 'Registro exitoso' });
                    } else {
                        this._formState.update(state => ({
                            ...state,
                            isLoading: false,
                            error: result.message || 'Error en el registro'
                        }));
                        resolve({ success: false, message: result.message || 'Error en el registro' });
                    }
                },
                error: (error) => {
                    console.error('Error en registro:', error);
                    // Extraer el mensaje de error del servidor si existe
                    let errorMessage = 'Error inesperado durante el registro';

                    if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    this._formState.update(state => ({ ...state, isLoading: false, error: errorMessage }));
                    resolve({ success: false, message: errorMessage });
                }
            });
        });
    }

    clearError(): void {
        this._formState.update(state => ({ ...state, error: null }));
    }

    resetForm(): void {
        this._formState.set({
            fullName: '',
            email: '',
            phone: '',
            role: '',
            password: '',
            confirmPassword: '',
            isLoading: false,
            error: null
        });
    }
}
