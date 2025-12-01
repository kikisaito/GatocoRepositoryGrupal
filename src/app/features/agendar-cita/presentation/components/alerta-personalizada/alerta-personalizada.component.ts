import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type TipoAlerta = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alerta-personalizada',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './alerta-personalizada.component.html',
  styleUrl: './alerta-personalizada.component.css'
})
export class AlertaPersonalizadaComponent {
  @Input() mensaje: string = '';
  @Input() tipo: TipoAlerta = 'info';
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  getIconoPorTipo(): string {
    switch (this.tipo) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}

