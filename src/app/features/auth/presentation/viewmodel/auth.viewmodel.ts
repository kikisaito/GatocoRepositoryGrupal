import { Injectable, computed, effect, inject } from '@angular/core';
import { AuthContext, UserInContext } from '../../../../core/utils/authcontext';

export interface AuthState {
    isAuthenticated: boolean;
    currentUser: UserInContext | null;
    isLoading: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthViewModel {
    private authContext = inject(AuthContext);

    // Signal para el estado de autenticación
    private _authState = computed<AuthState>(() => {
        const user = this.authContext.getCurrentUser();
        return {
            isAuthenticated: user !== null,
            currentUser: user,
            isLoading: false
        };
    });

    // Signals públicos
    authState = this._authState;
    isAuthenticated = computed(() => this._authState().isAuthenticated);
    currentUser = computed(() => this._authState().currentUser);

    constructor() {
        // Effect para logging (opcional - para debugging)
        effect(() => {
            const state = this._authState();
            console.log('AuthViewModel state changed:', {
                isAuthenticated: state.isAuthenticated,
                userEmail: state.currentUser?.email || 'null'
            });
        });
    }

    getCurrentUser(): UserInContext | null {
        return this.authContext.getCurrentUser();
    }

    logout(): void {
        this.authContext.logout();
    }
}
