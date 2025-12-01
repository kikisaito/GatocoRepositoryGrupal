import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../data/models/mascota.model';

@Component({
  selector: 'app-modal-confirmacion-eliminar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmacion-eliminar.component.html',
  styleUrl: './modal-confirmacion-eliminar.component.css'
})
export class ModalConfirmacionEliminarComponent {
  @Input() mascota: Mascota | null = null;
  @Input() error: string | null = null;
  @Output() confirmar = new EventEmitter<number>();
  @Output() cancelar = new EventEmitter<void>();

  onConfirmar(): void {
    if (this.mascota) {
      this.confirmar.emit(this.mascota.id);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}

