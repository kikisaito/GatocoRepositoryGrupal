import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../features/auth/data/models/user.model';
import { StorageUtil } from './storage.util';

// Tipo para usuario en contexto (sin password)
export type UserInContext = Omit<User, 'password'>;

@Injectable({
    providedIn: 'root'
})
export class AuthContext {
    private currentUserSubject = new BehaviorSubject<UserInContext | null>(this.getStoredUser());
    public currentUser$: Observable<UserInContext | null> = this.currentUserSubject.asObservable();

    constructor() {
        // El BehaviorSubject ya se inicializa con getStoredUser()
        // No es necesario hacer next() de nuevo
        console.log('AuthContext initialized with user:', this.currentUserSubject.value?.email || 'null');
    }

    private getStoredUser(): UserInContext | null {
        try {
            const stored = StorageUtil.getItem('currentUser');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error reading stored user:', error);
            return null;
        }
    }

    private storeUser(user: UserInContext | null): void {
        try {
            if (user) {
                StorageUtil.setItem('currentUser', JSON.stringify(user));
            } else {
                StorageUtil.removeItem('currentUser');
            }
        } catch (error) {
            console.error('Error storing user:', error);
        }
    }

    setCurrentUser(user: UserInContext | null): void {
        this.storeUser(user);
        this.currentUserSubject.next(user);
        console.log('User set in AuthContext:', user?.email || 'null');
    }

    getCurrentUser(): UserInContext | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return this.currentUserSubject.value !== null;
    }

    logout(): void {
        console.log('Logging out user');
        this.storeUser(null);
        this.currentUserSubject.next(null);
    }
}
