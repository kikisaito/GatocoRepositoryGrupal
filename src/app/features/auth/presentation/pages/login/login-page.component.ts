import { Component, OnDestroy, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PublicContainerComponent } from '../../../../shared/layout/publiccontainer/public-container.component';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { LoginUseCase } from '../../../domain/usecases/login.usecase';
import { LoginViewModel } from '../../viewmodel/login.viewmodel';

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [PublicContainerComponent, AuthFormComponent, AuthButtonComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loginFields: FormField[] = [
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'tu@email.com',
      required: true
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: 'Tu contraseña',
      required: true
    }
  ];

  // Usar el ViewModel como única fuente de verdad
  isLoading!: any;
  error!: any;

  constructor(
    private router: Router, 
    private loginUseCase: LoginUseCase,
    private loginViewModel: LoginViewModel
  ) {
    this.isLoading = this.loginViewModel.isLoading;
    this.error = computed(() => this.loginViewModel.error());
  }

  ngOnInit(): void {
    // Limpiar errores previos al inicializar
    this.loginViewModel.clearError();
  }

  async onFormSubmit(formValues: any) {
    // Actualizar el estado del ViewModel
    this.loginViewModel.updateEmail(formValues.email);
    this.loginViewModel.updatePassword(formValues.password);

    const result = await this.loginViewModel.login();
    
    if (result.success && result.user) {
      this.loginViewModel.resetForm();
      // Redirigir al dashboard (el mismo para ambos roles, pero el sidebar mostrará contenido diferente)
      this.router.navigate(['/dashboard']);
    }
    // El error ya se maneja en el ViewModel
  }

  onGoToRegister() {
    this.loginViewModel.resetForm();
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this.loginViewModel.resetForm();
  }
}
