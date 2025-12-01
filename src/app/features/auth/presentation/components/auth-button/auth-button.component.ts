import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-button.component.html',
  styleUrl: './auth-button.component.css'
})
export class AuthButtonComponent {
  @Input() buttonType: 'login' | 'register' = 'login';
  @Input() isLoading: boolean = false;
  @Input() type: string = 'submit';

  get buttonText(): string {
    if (this.buttonType === 'login') {
      return this.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión';
    } else {
      return this.isLoading ? 'Creando cuenta...' : 'Crear Cuenta';
    }
  }

  get buttonClass(): string {
    return this.buttonType === 'login' ? 'btn-login' : 'btn-register';
  }
}

