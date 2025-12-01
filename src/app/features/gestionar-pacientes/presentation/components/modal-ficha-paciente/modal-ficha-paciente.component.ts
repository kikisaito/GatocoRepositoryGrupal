import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';

@Component({
  selector: 'app-modal-ficha-paciente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './modal-ficha-paciente.component.html',
  styleUrl: './modal-ficha-paciente.component.css'
})
export class ModalFichaPacienteComponent {
  @Input() paciente: Mascota | null = null;
  @Input() duenoNombre: string = '';
  @Input() citasCount: number = 0;
  @Output() cerrar = new EventEmitter<void>();

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

  onCerrar(): void {
    this.cerrar.emit();
  }
}

