import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthContext } from '../../../../../../core/utils/authcontext';
import { User } from '../../../../../auth/data/models/user.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
    isAuthenticated: boolean = false;
    mobileMenuOpen: boolean = false;
    private subscription: Subscription = new Subscription();

    constructor(
        private router: Router,
        private authContext: AuthContext,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Suscribirse a cambios en el estado de autenticación
        this.subscription.add(
            this.authContext.currentUser$.subscribe(user => {
                this.isAuthenticated = user !== null;
                this.cdr.detectChanges();
            })
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onNavClick(navItem: string, event: Event) {
        event.preventDefault();
        alert(`Navegación a ${navItem} - Próximamente disponible`);
    }

    goToHome(event: Event) {
        event.preventDefault();
        this.router.navigate(['/']);
    }

    goToLogin(event: Event) {
        event.preventDefault();
        this.router.navigate(['/login']);
    }

    goToRegister(event: Event) {
        event.preventDefault();
        this.router.navigate(['/register']);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }
}
