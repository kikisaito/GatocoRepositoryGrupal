import { Component, OnDestroy, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PublicContainerComponent } from '../../../../shared/layout/publiccontainer/public-container.component';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { RegisterViewModel } from '../../viewmodel/register.viewmodel';

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [PublicContainerComponent, AuthFormComponent, AuthButtonComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  private registerViewModel = inject(RegisterViewModel);
  private router = inject(Router);

  registerFields: FormField[] = [
    {
      name: 'fullName',
      label: 'Nombre Completo',
      type: 'text',
      placeholder: 'Tu nombre completo',
      required: true
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'tu@email.com',
      required: true
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'tel',
      placeholder: 'Tu número de teléfono',
      required: true
    },
    {
      name: 'role',
      label: 'Tipo de Usuario',
      type: 'select',
      placeholder: 'Selecciona el tipo de usuario',
      required: true,
      options: [
        { value: 'cliente', label: 'Cliente' },
        { value: 'veterinario', label: 'Veterinario' }
      ]
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: 'Tu contraseña',
      required: true
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      type: 'password',
      placeholder: 'Confirma tu contraseña',
      required: true
    }
  ];

  // Usar signals del ViewModel con computed para obtener valores
  isLoading = computed(() => this.registerViewModel.isLoading());
  error = computed(() => this.registerViewModel.error() || '');

  ngOnInit(): void {
    // Limpiar errores previos al inicializar
    this.registerViewModel.clearError();
  }

  async onFormSubmit(formValues: any) {
    // Actualizar el estado del ViewModel primero
    this.registerViewModel.updateFullName(formValues.fullName);
    this.registerViewModel.updateEmail(formValues.email);
    this.registerViewModel.updatePhone(formValues.phone);
    this.registerViewModel.updateRole(formValues.role || ''); // Asegurar que sea string vacío si no hay valor
    this.registerViewModel.updatePassword(formValues.password);
    this.registerViewModel.updateConfirmPassword(formValues.confirmPassword);
    
    // Llamar al registro (el ViewModel valida las contraseñas y el role internamente)
    const result = await this.registerViewModel.register();
    
    if (result.success) {
      this.registerViewModel.resetForm();
      // Redirigir según el rol del usuario
      const userRole = formValues.role;
      if (userRole === 'veterinario') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
    // El error ya se maneja en el ViewModel y se mostrará automáticamente
  }

  onGoToLogin() {
    this.registerViewModel.resetForm();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.registerViewModel.resetForm();
  }
}
