import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { LoginUseCase } from './features/auth/domain/usecases/login.usecase';
import { RegisterUseCase } from './features/auth/domain/usecases/register.usecase';
import { UserRepository } from './features/auth/data/repository/user.repository';
import { AuthContext } from './core/utils/authcontext';
import { LoginViewModel } from './features/auth/presentation/viewmodel/login.viewmodel';
import { RegisterViewModel } from './features/auth/presentation/viewmodel/register.viewmodel';
import { AuthViewModel } from './features/auth/presentation/viewmodel/auth.viewmodel';
import { SecurityService } from './core/services/security.service';
import { AuthApiService } from './core/services/auth-api.service';
import { authInterceptor, errorInterceptor } from './core/interceptors';
import { USER_REPOSITORY_TOKEN, SECURITY_SERVICE_TOKEN } from './features/auth/domain/interfaces/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(), // Habilitar fetch para SSR
      withInterceptors([authInterceptor, errorInterceptor]) // Interceptors para auth y errores
    ),
    SecurityService,
    { provide: SECURITY_SERVICE_TOKEN, useExisting: SecurityService },
    AuthApiService,
    UserRepository,
    { provide: USER_REPOSITORY_TOKEN, useExisting: UserRepository },
    AuthContext,
    LoginUseCase,
    RegisterUseCase,
    LoginViewModel,
    RegisterViewModel,
    AuthViewModel
  ]
};
