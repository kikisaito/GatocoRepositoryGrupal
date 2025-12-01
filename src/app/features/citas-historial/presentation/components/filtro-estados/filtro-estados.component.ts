import { Component, Input, Output, EventEmitter, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-filtro-estados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './filtro-estados.component.html',
  styleUrl: './filtro-estados.component.css'
})
export class FiltroEstadosComponent implements OnInit {
  @Input() isVeterinario: boolean = false;
  @Output() estadoSeleccionado = new EventEmitter<string | null>();

  estadoSeleccionadoValue: string | null = null;

  // Estados disponibles según el rol
  // Para el cliente en el historial: solo cancelada y completada (las pendientes están en dashboard)
  estadosCliente = [
    { value: null, label: 'Todos los estados' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'completada', label: 'Completada' }
  ];

  estadosVeterinario = [
    { value: null, label: 'Todos los estados' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'completada', label: 'Completada' }
  ];

  estados = computed(() => {
    // Tanto veterinario como cliente en historial solo muestran cancelada y completada
    return this.isVeterinario ? this.estadosVeterinario : this.estadosCliente;
  });

  ngOnInit(): void {
    // Si hay un estado pendiente seleccionado (no disponible en historial), resetearlo
    if (this.estadoSeleccionadoValue === 'pendiente') {
      this.estadoSeleccionadoValue = null;
      this.estadoSeleccionado.emit(null);
    }
  }

  onEstadoChange(estado: string | null): void {
    this.estadoSeleccionadoValue = estado;
    this.estadoSeleccionado.emit(estado);
  }
}

