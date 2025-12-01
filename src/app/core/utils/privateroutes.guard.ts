import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthContext } from './authcontext';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PrivateRoutesGuard implements CanActivate {
  
  constructor(
    private authContext: AuthContext,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Esperar a que el observable se inicialice completamente
    return this.authContext.currentUser$.pipe(
      take(1), // Tomar el primer valor emitido y completar
      tap(user => {
        console.log('PrivateRoutesGuard - Current user:', user);
      }),
      map(user => {
        const isAuthenticated = user !== null;
        
        if (!isAuthenticated) {
          console.log('User is not authenticated, redirecting to login');
          this.router.navigate(['/login']);
          return false;
        }
        
        console.log('User is authenticated, allowing access');
        return true;
      })
    );
  }
}

