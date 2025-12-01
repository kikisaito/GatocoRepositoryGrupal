import { Component, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Mascota } from '../../../data/models/mascota.model';

@Component({
  selector: 'app-lista-mascotas-gestion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './lista-mascotas-gestion.component.html',
  styleUrl: './lista-mascotas-gestion.component.css'
})
export class ListaMascotasGestionComponent {
  @Input() mascotas: Mascota[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() mascotasConCitas: Set<number> = new Set();
  @Output() iniciarEdicion = new EventEmitter<Mascota>();
  @Output() confirmarEliminar = new EventEmitter<Mascota>();

  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  mascotaSeleccionada: Mascota | null = null;

  tieneCitas(mascotaId: number): boolean {
    return this.mascotasConCitas.has(mascotaId);
  }

  onAbrirMenu(mascota: Mascota, event: Event): void {
    event.stopPropagation();
    this.mascotaSeleccionada = mascota;
  }

  cerrarMenuAbierto(): void {
    // Encontrar el trigger del menú que está abierto y cerrarlo
    const triggerAbierto = this.menuTriggers?.find(trigger => trigger.menuOpen);
    if (triggerAbierto) {
      triggerAbierto.closeMenu();
    }
  }

  onIniciarEdicion(event: Event): void {
    event.stopPropagation();
    if (this.mascotaSeleccionada) {
      this.iniciarEdicion.emit(this.mascotaSeleccionada);
      this.mascotaSeleccionada = null;
      // Cerrar el menú
      setTimeout(() => {
        this.cerrarMenuAbierto();
      }, 0);
    }
  }

  onEliminar(event: Event): void {
    event.stopPropagation();
    if (this.mascotaSeleccionada) {
      this.confirmarEliminar.emit(this.mascotaSeleccionada);
      this.mascotaSeleccionada = null;
      // Cerrar el menú
      setTimeout(() => {
        this.cerrarMenuAbierto();
      }, 0);
    }
  }

  getFechaFormateada(fecha: string | undefined): string {
    if (!fecha) return '';
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
}

