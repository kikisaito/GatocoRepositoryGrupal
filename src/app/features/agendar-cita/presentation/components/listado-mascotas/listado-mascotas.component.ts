import { Component, inject, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { GetMascotasUseCase } from '../../../../gestionar-mascotas/domain/usecases/get-mascotas.usecase';

@Component({
  selector: 'app-listado-mascotas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './listado-mascotas.component.html',
  styleUrl: './listado-mascotas.component.css'
})
export class ListadoMascotasComponent implements OnInit {
  private getMascotasUseCase = inject(GetMascotasUseCase);

  mascotaSeleccionadaChange = output<Mascota>();

  // Datos del backend con Signals
  mascotas = signal<Mascota[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMascotas();
  }

  cargarMascotas(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.getMascotasUseCase.execute().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Mapear campos del backend (inglés) al frontend (español)
          const mascotasMapeadas = response.data.map((mascota: any) => ({
            id: mascota.id,
            nombre: mascota.name || mascota.nombre,
            especie: mascota.species || mascota.especie,
            raza: mascota.breed || mascota.raza,
            edad: mascota.age || mascota.edad,
            fechaNacimiento: mascota.birthDate || mascota.fechaNacimiento,
            sexo: mascota.gender || mascota.sexo,
            duenoId: mascota.clientId || mascota.duenoId,
            foto: mascota.photoUrl || mascota.foto || mascota.photo || null,
            createdAt: mascota.createdAt,
            updatedAt: mascota.updatedAt
          }));
          
          console.log('Mascotas mapeadas con fotos:', mascotasMapeadas.map((m: Mascota) => ({ nombre: m.nombre, foto: m.foto })));
          
          this.mascotas.set(mascotasMapeadas);
          console.log('Mascotas cargadas para agendar cita:', mascotasMapeadas.length);
        } else {
          this.error.set(response.message || 'Error al cargar mascotas');
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar mascotas:', error);
        this.error.set('Error al cargar las mascotas');
        this.isLoading.set(false);
      }
    });
  }

  seleccionarMascota(mascota: Mascota): void {
    console.log('Seleccionando mascota:', mascota);
    // Solo emitir el evento, el modal manejará la confirmación
    this.mascotaSeleccionadaChange.emit(mascota);
  }
}

