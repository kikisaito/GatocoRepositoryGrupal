import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GetMascotasUseCase } from '../../../gestionar-mascotas/domain/usecases/get-mascotas.usecase';
import { Mascota } from '../../../gestionar-mascotas/data/models/mascota.model';
import { GetCitasUseCase } from '../../../citas-historial/domain/usecases/get-citas.usecase';
import { Cita } from '../../../citas-historial/data/models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardViewModel {
  private getMascotasUseCase = inject(GetMascotasUseCase);
  private getCitasUseCase = inject(GetCitasUseCase);

  // Signal privado para las mascotas
  private _mascotas = signal<Mascota[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Signals privados para las citas
  private _citas = signal<Cita[]>([]);
  private _isLoadingCitas = signal<boolean>(false);

  // Signals calculados
  mascotas = computed(() => this._mascotas());
  isLoading = computed(() => this._isLoading());
  error = computed(() => this._error());
  
  // Signals calculados para citas
  proximasCitas = computed(() => {
    const citas = this._citas();
    // Ordenar por fecha descendente y tomar las primeras 3
    return citas
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 3);
  });
  
  // Estado completo como readonly
  mascotasState = this._mascotas.asReadonly();

  constructor() {
    // Effect para logging (opcional - para debugging)
    effect(() => {
      const mascotas = this._mascotas();
      const citas = this._citas();
      console.log('DashboardViewModel state changed:', {
        mascotasCount: mascotas.length,
        citasCount: citas.length,
        isLoading: this._isLoading(),
        hasError: !!this._error()
      });
    });
  }

  cargarCitas(): void {
    this._isLoadingCitas.set(true);

    this.getCitasUseCase.execute().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this._citas.set(response.data);
          console.log('Citas cargadas en dashboard:', response.data.length);
        }
        this._isLoadingCitas.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar citas:', error);
        this._isLoadingCitas.set(false);
      }
    });
  }

  cargarMascotas(): void {
    this._isLoading.set(true);
    this._error.set(null);

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
          
          this._mascotas.set(mascotasMapeadas);
          console.log('Mascotas cargadas:', mascotasMapeadas.length);
        } else {
          this._error.set(response.message || 'Error al cargar mascotas');
        }
        this._isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar mascotas:', error);
        this._error.set('Error al cargar las mascotas');
        this._isLoading.set(false);
      }
    });
  }

  clearError(): void {
    this._error.set(null);
  }

  // Método para obtener el ícono según la especie
  getTipoIcon(especie: string): string {
    if (!especie) return '🐾';
    
    const especieLower = especie.toLowerCase();
    if (especieLower.includes('perro')) return '🐕';
    if (especieLower.includes('gato')) return '🐱';
    if (especieLower.includes('conejo')) return '🐰';
    if (especieLower.includes('ave') || especieLower.includes('pájaro')) return '🐦';
    return '🐾';
  }
}

