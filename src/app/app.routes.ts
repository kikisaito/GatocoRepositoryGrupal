import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/presentation/pages/home-page/home-page.component';
import { LoginPageComponent } from './features/auth/presentation/pages/login/login-page.component';
import { RegisterPageComponent } from './features/auth/presentation/pages/register/register-page.component';
import { DashboardComponent } from './features/dashboard/presentation/pages/dashboard/dashboard.component';
import { CitasHistorialComponent } from './features/citas-historial/presentation/pages/citas-historial/citas-historial.component';
import { AgendarCitaComponent } from './features/agendar-cita/presentation/pages/agendar-cita/agendar-cita.component';
import { GestionarMascotasComponent } from './features/gestionar-mascotas/presentation/pages/gestionar-mascotas/gestionar-mascotas.component';
import { GestionarPacientesComponent } from './features/gestionar-pacientes/presentation/pages/gestionar-pacientes/gestionar-pacientes.component';
import { PublicRoutesGuard } from './core/utils/publicroutes.guard';
import { PrivateRoutesGuard } from './core/utils/privateroutes.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: HomePageComponent,
    canActivate: [PublicRoutesGuard]
  },
  { 
    path: 'login', 
    component: LoginPageComponent,
    canActivate: [PublicRoutesGuard]
  },
  { 
    path: 'register', 
    component: RegisterPageComponent,
    canActivate: [PublicRoutesGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [PrivateRoutesGuard]
  },
  { 
    path: 'gestionar-mascotas', 
    component: GestionarMascotasComponent,
    canActivate: [PrivateRoutesGuard]
  },
  { 
    path: 'gestionar-pacientes', 
    component: GestionarPacientesComponent,
    canActivate: [PrivateRoutesGuard]
  },
  { 
    path: 'citas-historial', 
    component: CitasHistorialComponent,
    canActivate: [PrivateRoutesGuard]
  },
  { 
    path: 'agendar-cita', 
    component: AgendarCitaComponent,
    canActivate: [PrivateRoutesGuard]
  },
  { path: '**', redirectTo: '' } // Redirige cualquier ruta no encontrada a home
];
