import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthContext } from './authcontext';

@Injectable({
  providedIn: 'root'
})
export class ProtectedRoutes implements CanActivate {
  
  constructor(
    private authContext: AuthContext,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authContext.isAuthenticated();
    const currentPath = state.url;

    // Rutas públicas (accesibles solo cuando NO está autenticado)
    const publicRoutes = ['/', '/login', '/register'];
    
    // Rutas protegidas (accesibles solo cuando SÍ está autenticado)
    const protectedRoutes = ['/dashboard', '/registrar-mascota'];

    if (isAuthenticated) {
      // Usuario autenticado: NO puede acceder a rutas públicas
      if (publicRoutes.includes(currentPath)) {
        // Redirigir al dashboard unificado
        this.router.navigate(['/dashboard']);
        return false;
      }
      // Usuario autenticado: SÍ puede acceder a rutas protegidas
      return true;
    } else {
      // Usuario NO autenticado: SÍ puede acceder a rutas públicas
      if (publicRoutes.includes(currentPath)) {
        return true;
      }
      // Usuario NO autenticado: NO puede acceder a rutas protegidas
      this.router.navigate(['/']);
      return false;
    }
  }
}
