import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LoginUseCase } from './features/auth/domain/usecases/login.usecase';
import { RegisterUseCase } from './features/auth/domain/usecases/register.usecase';
import { UserRepository } from './features/auth/data/repository/user.repository';
import { AuthContext } from './core/utils/authcontext';
import { LoginViewModel } from './features/auth/presentation/viewmodel/login.viewmodel';
import { RegisterViewModel } from './features/auth/presentation/viewmodel/register.viewmodel';
import { AuthViewModel } from './features/auth/presentation/viewmodel/auth.viewmodel';
import { SecurityService } from './core/services/security.service';
import { AuthApiService } from './core/services/auth-api.service';
import { MascotasApiService } from './core/services/mascotas-api.service';
import { ServiciosApiService } from './core/services/servicios-api.service';
import { CitasApiService } from './core/services/citas-api.service';
import { DashboardApiService } from './core/services/dashboard-api.service';
import { authInterceptor, errorInterceptor } from './core/interceptors';
import { USER_REPOSITORY_TOKEN, SECURITY_SERVICE_TOKEN } from './features/auth/domain/interfaces/tokens';
import { MascotaRepository } from './features/gestionar-mascotas/data/repository/mascota.repository';
import { CreateMascotaUseCase } from './features/gestionar-mascotas/domain/usecases/create-mascota.usecase';
import { GetMascotasUseCase } from './features/gestionar-mascotas/domain/usecases/get-mascotas.usecase';
import { UpdateMascotaUseCase } from './features/gestionar-mascotas/domain/usecases/update-mascota.usecase';
import { DeleteMascotaUseCase } from './features/gestionar-mascotas/domain/usecases/delete-mascota.usecase';
import { GestionarMascotasViewModel } from './features/gestionar-mascotas/presentation/viewmodel/gestionar-mascotas.viewmodel';
import { MASCOTA_REPOSITORY_TOKEN } from './features/gestionar-mascotas/domain/interfaces/tokens';
import { DashboardViewModel } from './features/dashboard/presentation/viewmodel/dashboard.viewmodel';
import { CitaRepository } from './features/citas-historial/data/repository/cita.repository';
import { GetCitasUseCase } from './features/citas-historial/domain/usecases/get-citas.usecase';
import { CreateCitaUseCase } from './features/agendar-cita/domain/usecases/create-cita.usecase';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(), // Habilitar fetch para SSR
      withInterceptors([authInterceptor, errorInterceptor]) // Interceptors para auth y errores
    ),
    SecurityService,
    { provide: SECURITY_SERVICE_TOKEN, useExisting: SecurityService },
    AuthApiService,
    MascotasApiService,
    ServiciosApiService,
    CitasApiService,
    DashboardApiService,
    UserRepository,
    { provide: USER_REPOSITORY_TOKEN, useExisting: UserRepository },
    AuthContext,
    LoginUseCase,
    RegisterUseCase,
    LoginViewModel,
    RegisterViewModel,
    AuthViewModel,
    // Mascotas feature
    MascotaRepository,
    { provide: MASCOTA_REPOSITORY_TOKEN, useExisting: MascotaRepository },
    CreateMascotaUseCase,
    GetMascotasUseCase,
    UpdateMascotaUseCase,
    DeleteMascotaUseCase,
    GestionarMascotasViewModel,
    // Dashboard feature
    DashboardViewModel,
    // Citas historial feature
    CitaRepository,
    GetCitasUseCase,
    // Agendar cita feature
    CreateCitaUseCase
  ]
};
