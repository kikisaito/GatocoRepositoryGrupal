import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';

@Component({
  selector: 'app-modal-detalles-mascota',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './modal-detalles-mascota.component.html',
  styleUrl: './modal-detalles-mascota.component.css'
})
export class ModalDetallesMascotaComponent {
  @Input() mascota: Mascota | null = null;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  getFechaFormateada(fecha: string | undefined): string {
    if (!fecha) return 'No especificada';
    try {
      const fechaObj = new Date(fecha + 'T00:00:00');
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  onConfirmar(): void {
    this.confirmar.emit();
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}

