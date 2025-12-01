import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthContext, UserInContext } from '../../../../../../core/utils/authcontext';
import { Subscription } from 'rxjs';

interface MenuItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: UserInContext | null = null;
  private subscription: Subscription = new Subscription();
  mobileMenuOpen: boolean = false;
  
  // Features disponibles para mostrar en el menú según el rol
  menuItems: MenuItem[] = [];

  constructor(
    private authContext: AuthContext,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authContext.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.updateMenuItems();
      })
    );
  }

  private updateMenuItems(): void {
    if (this.currentUser?.role === 'veterinario') {
      this.menuItems = [
        {
          path: '/dashboard',
          label: 'Dashboard'
        },
        {
          path: '/gestionar-pacientes',
          label: 'Gestionar Pacientes'
        },
        {
          path: '/citas-historial',
          label: 'Historial de Citas'
        }
      ];
    } else {
      // Menú para clientes
      this.menuItems = [
        {
          path: '/dashboard',
          label: 'Dashboard'
        },
        {
          path: '/gestionar-mascotas',
          label: 'Gestionar Mascotas'
        },
        {
          path: '/agendar-cita',
          label: 'Agendar Cita'
        },
        {
          path: '/citas-historial',
          label: 'Historial de Citas'
        }
      ];
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    this.authContext.logout();
    this.router.navigate(['/']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getUserRoleDisplay(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role === 'veterinario' ? 'Veterinario' : 'Cliente';
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }

  shouldShowMenu(): boolean {
    // Mostrar menú si el usuario es Cliente o Veterinario
    return this.currentUser?.role === 'cliente' || this.currentUser?.role === 'veterinario';
  }
}

