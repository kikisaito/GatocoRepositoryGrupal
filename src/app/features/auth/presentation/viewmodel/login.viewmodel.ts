import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { LoginUseCase } from '../../domain/usecases/login.usecase';
import { AuthResponse } from '../../data/models/user.model';
import { AuthContext } from '../../../../core/utils/authcontext';

export interface LoginFormState {
    email: string;
    password: string;
    isLoading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class LoginViewModel {
    private loginUseCase = inject(LoginUseCase);
    private authContext = inject(AuthContext);

    // Signal privado para el estado del formulario
    private _formState = signal<LoginFormState>({
        email: '',
        password: '',
        isLoading: false,
        error: null
    });

    // Signals calculados para valores individuales
    email = computed(() => this._formState().email);
    password = computed(() => this._formState().password);
    isLoading = computed(() => this._formState().isLoading);
    error = computed(() => this._formState().error);

    // Estado completo como readonly para acceso externo
    formState = this._formState.asReadonly();

    constructor() {
        // Effect para logging (opcional - para debugging)
        effect(() => {
            const state = this._formState();
            console.log('LoginViewModel state changed:', {
                email: state.email,
                isLoading: state.isLoading,
                hasError: !!state.error
            });
        });
    }

    updateEmail(email: string): void {
        this._formState.update(state => ({ ...state, email }));
    }

    updatePassword(password: string): void {
        this._formState.update(state => ({ ...state, password }));
    }

    login(): Promise<AuthResponse> {
        const currentState = this._formState();

        this._formState.update(state => ({ ...state, isLoading: true, error: null }));

        return new Promise((resolve, reject) => {
            this.loginUseCase.execute(currentState.email, currentState.password).subscribe({
                next: (result) => {
                    if (result.success && result.user) {
                        // Establecer usuario en contexto
                        this.authContext.setCurrentUser(result.user);
                        this._formState.update(state => ({ ...state, isLoading: false, error: null }));
                        resolve(result);
                    } else {
                        this._formState.update(state => ({ ...state, isLoading: false, error: result.message }));
                        resolve(result);
                    }
                },
                error: (error) => {
                    console.error('Error en login:', error);
                    let errorMessage = 'Error de conexión con el servidor';

                    // Si hay un mensaje de error del servidor, usarlo
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
            email: '',
            password: '',
            isLoading: false,
            error: null
        });
    }
}
