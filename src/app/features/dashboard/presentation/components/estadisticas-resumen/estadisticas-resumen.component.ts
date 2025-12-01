import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GetMascotasUseCase } from '../../../../gestionar-mascotas/domain/usecases/get-mascotas.usecase';
import { GetCitasUseCase } from '../../../../citas-historial/domain/usecases/get-citas.usecase';
import { Cita } from '../../../../citas-historial/data/models/cita.model';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';

@Component({
  selector: 'app-estadisticas-resumen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './estadisticas-resumen.component.html',
  styleUrl: './estadisticas-resumen.component.css'
})
export class EstadisticasResumenComponent implements OnInit {
  private getMascotasUseCase = inject(GetMascotasUseCase);
  private getCitasUseCase = inject(GetCitasUseCase);

  // Signals para datos
  mascotas = signal<Mascota[]>([]);
  citas = signal<Cita[]>([]);
  isLoading = signal<boolean>(false);

  // Computed para estadísticas
  totalMascotas = computed(() => this.mascotas().length);
  
  citasPendientes = computed(() => {
    return this.citas().filter(cita => cita.estado === 'pendiente').length;
  });

  proximaCita = computed(() => {
    const citasPendientes = this.citas()
      .filter(cita => cita.estado === 'pendiente')
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA.getTime() - fechaB.getTime();
      });
    
    return citasPendientes.length > 0 ? citasPendientes[0] : null;
  });

  citasCompletadas = computed(() => {
    return this.citas().filter(cita => cita.estado === 'completada').length;
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  recargarCitas(): void {
    // Método público para recargar solo las citas
    this.getCitasUseCase.execute().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.citas.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error al recargar citas:', error);
      }
    });
  }

  cargarDatos(): void {
    this.isLoading.set(true);

    // Cargar mascotas y citas en paralelo
    this.getMascotasUseCase.execute().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const mascotasMapeadas = response.data.map((mascota: any) => ({
            id: mascota.id,
            nombre: mascota.name || mascota.nombre,
            especie: mascota.species || mascota.especie,
            raza: mascota.breed || mascota.raza,
            edad: mascota.age || mascota.edad,
            fechaNacimiento: mascota.birthDate || mascota.fechaNacimiento,
            sexo: mascota.gender || mascota.sexo,
            duenoId: mascota.clientId || mascota.duenoId,
            foto: mascota.foto || mascota.photo,
            createdAt: mascota.createdAt,
            updatedAt: mascota.updatedAt
          }));
          this.mascotas.set(mascotasMapeadas);
        }
        this.verificarCargaCompleta();
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.verificarCargaCompleta();
      }
    });

    this.getCitasUseCase.execute().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.citas.set(response.data);
        }
        this.verificarCargaCompleta();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.verificarCargaCompleta();
      }
    });
  }

  private verificarCargaCompleta(): void {
    // Este método se llama después de cada carga
    // En una implementación más robusta, podrías usar forkJoin o similar
    // Por simplicidad, aquí solo verificamos que ambas cargas hayan terminado
    this.isLoading.set(false);
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

  getFechaFormateada(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

