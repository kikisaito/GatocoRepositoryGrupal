import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-botones-accion-cita',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './botones-accion-cita.component.html',
  styleUrl: './botones-accion-cita.component.css'
})
export class BotonesAccionCitaComponent {
  @Input() mostrarAtras: boolean = false;
  @Input() textoSiguiente: string = 'Siguiente';
  @Output() siguiente = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() atras = new EventEmitter<void>();

  onSiguiente(): void {
    this.siguiente.emit();
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  onAtras(): void {
    this.atras.emit();
  }
}

