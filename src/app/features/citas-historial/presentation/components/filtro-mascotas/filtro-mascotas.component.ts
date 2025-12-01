import { Component, Input, Output, EventEmitter, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GetMascotasUseCase } from '../../../../gestionar-mascotas/domain/usecases/get-mascotas.usecase';
import { GetCitasUseCase } from '../../../domain/usecases/get-citas.usecase';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';

@Component({
  selector: 'app-filtro-mascotas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './filtro-mascotas.component.html',
  styleUrl: './filtro-mascotas.component.css'
})
export class FiltroMascotasComponent implements OnInit {
  @Input() mascotasNombres: string[] = [];
  @Output() mascotaSeleccionada = new EventEmitter<string | null>();

  private getMascotasUseCase = inject(GetMascotasUseCase);
  private getCitasUseCase = inject(GetCitasUseCase);
  private authContext = inject(AuthContext);

  mascotaSeleccionadaValue: string | null = null;
  mascotas = signal<Mascota[]>([]);
  mascotasNombresSignal = signal<string[]>([]);
  isLoading = signal(false);
  isVeterinario = signal<boolean>(false);

  // Textos dinámicos según el rol
  labelFiltro = computed(() => {
    return this.isVeterinario() ? 'Filtrar por Paciente' : 'Filtrar por Mascota';
  });

  textoCargando = computed(() => {
    return this.isVeterinario() ? 'Cargando pacientes...' : 'Cargando mascotas...';
  });

  textoTodos = computed(() => {
    return this.isVeterinario() ? 'Todos los pacientes' : 'Todas las mascotas';
  });

  ngOnInit(): void {
    const currentUser = this.authContext.getCurrentUser();
    this.isVeterinario.set(currentUser?.role === 'veterinario');
    
    // Suscribirse a cambios del usuario
    this.authContext.currentUser$.subscribe(user => {
      this.isVeterinario.set(user?.role === 'veterinario');
    });
    
    this.cargarMascotas();
  }

  cargarMascotas(): void {
    this.isLoading.set(true);

    if (this.isVeterinario()) {
      // Para veterinarios: obtener mascotas únicas de las citas
      this.getCitasUseCase.execute().subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            // Extraer nombres únicos de mascotas de las citas
            const mascotasNombres: string[] = response.data
              .map((cita: any) => String(cita.mascota || cita.petName || ''))
              .filter((nombre: string) => nombre && nombre.trim() !== '');
            
            // Eliminar duplicados y ordenar
            const mascotasUnicas: string[] = [...new Set(mascotasNombres)].sort();
            
            this.mascotasNombresSignal.set(mascotasUnicas);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar citas para obtener mascotas:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      // Para clientes: obtener mascotas del cliente
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
              foto: mascota.foto || mascota.photo,
              createdAt: mascota.createdAt,
              updatedAt: mascota.updatedAt
            }));
            
            this.mascotas.set(mascotasMapeadas);
            // Extraer nombres de mascotas para el filtro
            this.mascotasNombresSignal.set(mascotasMapeadas.map((m: Mascota) => m.nombre));
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar mascotas:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onMascotaChange(mascota: string | null): void {
    this.mascotaSeleccionadaValue = mascota;
    this.mascotaSeleccionada.emit(mascota);
  }
}

