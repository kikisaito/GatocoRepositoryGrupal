import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { Cita } from '../../../../citas-historial/data/models/cita.model';

@Component({
  selector: 'app-modal-historial-citas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './modal-historial-citas.component.html',
  styleUrl: './modal-historial-citas.component.css'
})
export class ModalHistorialCitasComponent {
  @Input() paciente: Mascota | null = null;
  @Input() citas: Cita[] = [];
  @Output() cerrar = new EventEmitter<void>();

  // Filtrar citas para mostrar solo canceladas y completadas
  citasFiltradas = computed(() => {
    return this.citas.filter(cita => 
      cita.estado === 'cancelada' || cita.estado === 'completada'
    ).sort((a, b) => {
      // Ordenar por fecha descendente (más recientes primero)
      const fechaA = new Date(a.fecha + 'T' + a.hora).getTime();
      const fechaB = new Date(b.fecha + 'T' + b.hora).getTime();
      return fechaB - fechaA;
    });
  });

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'estado-completada';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return '';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  }

  getFechaFormateada(fecha: string): string {
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

  getHoraFormateada12h(hora24: string): string {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    const hora = parseInt(horas, 10);
    const periodo = hora >= 12 ? 'PM' : 'AM';
    let hora12 = hora % 12;
    if (hora12 === 0) hora12 = 12;
    return `${hora12}:${minutos} ${periodo}`;
  }

  getIconoPorServicio(nombreServicio: string): string {
    const nombre = nombreServicio.toLowerCase().trim();
    
    if (nombre.includes('consulta general') || nombre.includes('consulta')) {
      return 'medical_services';
    } else if (nombre.includes('vacunación') || nombre.includes('vacuna')) {
      return 'vaccines';
    } else if (nombre.includes('emergencia') || nombre.includes('emergency')) {
      return 'emergency';
    } else if (nombre.includes('baño') || nombre.includes('corte') || nombre.includes('bano')) {
      return 'content_cut';
    }
    
    // Icono por defecto
    return 'medical_services';
  }

  isJson(str: string): boolean {
    try {
      const result = JSON.parse(str);
      return (typeof result === 'object' && result !== null);
    } catch (e) {
      return false;
    }
  }

  getNotasParsed(notas: string): any {
    try {
      return JSON.parse(notas);
    } catch (e) {
      return null;
    }
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}

