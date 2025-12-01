import { Injectable, inject, signal, computed } from '@angular/core';
import { GetMascotasUseCase, UpdateMascotaUseCase, DeleteMascotaUseCase, CreateMascotaUseCase } from '../../domain/usecases';
import { Mascota, UpdateMascotaRequest, CreateMascotaRequest } from '../../data/models/mascota.model';
import { GetCitasUseCase } from '../../../citas-historial/domain/usecases/get-citas.usecase';
import { MascotasApiService } from '../../../../core/services/mascotas-api.service';

@Injectable({
  providedIn: 'root'
})
export class GestionarMascotasViewModel {
  private getMascotasUseCase = inject(GetMascotasUseCase);
  private updateMascotaUseCase = inject(UpdateMascotaUseCase);
  private deleteMascotaUseCase = inject(DeleteMascotaUseCase);
  private createMascotaUseCase = inject(CreateMascotaUseCase);
  private getCitasUseCase = inject(GetCitasUseCase);
  private mascotasApiService = inject(MascotasApiService);

  // Estados
  private _mascotas = signal<Mascota[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _mascotaEditando = signal<Mascota | null>(null);
  private _mostrarModalEditar = signal<boolean>(false);
  private _mostrarModalEliminar = signal<boolean>(false);
  private _mascotaAEliminar = signal<Mascota | null>(null);
  private _mostrarModalRegistrar = signal<boolean>(false);
  private _mascotasConCitas = signal<Set<number>>(new Set());

  // Computed
  mascotas = computed(() => this._mascotas());
  isLoading = computed(() => this._isLoading());
  error = computed(() => this._error());
  mascotaEditando = computed(() => this._mascotaEditando());
  mostrarModalEditar = computed(() => this._mostrarModalEditar());
  mostrarModalEliminar = computed(() => this._mostrarModalEliminar());
  mascotaAEliminar = computed(() => this._mascotaAEliminar());
  mostrarModalRegistrar = computed(() => this._mostrarModalRegistrar());
  mascotasConCitas = computed(() => this._mascotasConCitas());

  cargarMascotas(): void {
    this._isLoading.set(true);
    this._error.set(null);

    // Cargar mascotas y citas en paralelo
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
            foto: mascota.photoUrl || mascota.foto || mascota.photo,
            createdAt: mascota.createdAt,
            updatedAt: mascota.updatedAt
          }));
          
          this._mascotas.set(mascotasMapeadas);
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

    // Cargar citas para identificar mascotas con citas
    this.getCitasUseCase.execute().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Crear un Set con los IDs de mascotas que tienen citas
          const mascotasConCitasSet = new Set<number>();
          response.data.forEach((cita: any) => {
            if (cita.mascotaId) {
              mascotasConCitasSet.add(cita.mascotaId);
            }
          });
          this._mascotasConCitas.set(mascotasConCitasSet);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar citas:', error);
        // No mostramos error al usuario, solo logueamos
        // Si falla, simplemente no ocultaremos el botón de eliminar
      }
    });
  }

  iniciarEdicion(mascota: Mascota): void {
    this._mascotaEditando.set(mascota);
    this._mostrarModalEditar.set(true);
    this._error.set(null);
  }

  cancelarEdicion(): void {
    this._mascotaEditando.set(null);
    this._mostrarModalEditar.set(false);
    this._error.set(null);
  }

  actualizarMascota(id: number, datos: UpdateMascotaRequest): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this._error.set(null);

      this.updateMascotaUseCase.execute(id, datos).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Recargar mascotas para reflejar los cambios
            this.cargarMascotas();
            this._mascotaEditando.set(null);
            this._mostrarModalEditar.set(false);
            resolve({ success: true, message: 'Mascota actualizada exitosamente' });
          } else {
            const errorMessage = response.message || 'Error al actualizar la mascota';
            this._error.set(errorMessage);
            resolve({ success: false, message: errorMessage });
          }
          this._isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error al actualizar mascota:', error);
          const errorMessage = error.error?.message || error.message || 'Error al actualizar la mascota';
          this._error.set(errorMessage);
          this._isLoading.set(false);
          resolve({ success: false, message: errorMessage });
        }
      });
    });
  }

  confirmarEliminar(mascota: Mascota): void {
    this._mascotaAEliminar.set(mascota);
    this._mostrarModalEliminar.set(true);
  }

  cancelarEliminacion(): void {
    this._mostrarModalEliminar.set(false);
    this._mascotaAEliminar.set(null);
    this._error.set(null); // Limpiar el error al cerrar el modal
  }

  eliminarMascota(id: number): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this._error.set(null);

      this.deleteMascotaUseCase.execute(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Recargar mascotas para reflejar los cambios
            this.cargarMascotas();
            this._mostrarModalEliminar.set(false);
            this._mascotaAEliminar.set(null);
            resolve({ success: true, message: 'Mascota eliminada exitosamente' });
          } else {
            const errorMessage = response.message || 'Error al eliminar la mascota';
            this._error.set(errorMessage);
            resolve({ success: false, message: errorMessage });
          }
          this._isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error al eliminar mascota:', error);
          const errorMessage = error.error?.message || error.message || 'Error al eliminar la mascota';
          this._error.set(errorMessage);
          this._isLoading.set(false);
          resolve({ success: false, message: errorMessage });
        }
      });
    });
  }

  abrirModalRegistrar(): void {
    this._mostrarModalRegistrar.set(true);
  }

  cerrarModalRegistrar(): void {
    this._mostrarModalRegistrar.set(false);
  }

  async registrarMascota(datos: CreateMascotaRequest): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this._error.set(null);

      this.createMascotaUseCase.execute(datos).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Recargar mascotas para reflejar los cambios
            this.cargarMascotas();
            this._mostrarModalRegistrar.set(false);
            resolve({ success: true, message: 'Mascota registrada exitosamente' });
          } else {
            this._error.set(response.message || 'Error al registrar la mascota');
            resolve({ success: false, message: response.message || 'Error al registrar la mascota' });
          }
          this._isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error al registrar mascota:', error);
          this._error.set('Error al registrar la mascota');
          this._isLoading.set(false);
          resolve({ success: false, message: 'Error al registrar la mascota' });
        }
      });
    });
  }

  clearError(): void {
    this._error.set(null);
  }

  async subirFoto(id: number, file: File): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this._error.set(null);

      this.mascotasApiService.uploadPhoto(id, file).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Recargar mascotas para reflejar los cambios
            this.cargarMascotas();
            resolve({ success: true, message: 'Foto subida exitosamente' });
          } else {
            const errorMessage = response.message || 'Error al subir la foto';
            this._error.set(errorMessage);
            resolve({ success: false, message: errorMessage });
          }
          this._isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error al subir foto:', error);
          const errorMessage = error.error?.message || error.message || 'Error al subir la foto';
          this._error.set(errorMessage);
          this._isLoading.set(false);
          resolve({ success: false, message: errorMessage });
        }
      });
    });
  }

  async eliminarFoto(id: number): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this._isLoading.set(true);
      this._error.set(null);

      this.mascotasApiService.deletePhoto(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Recargar mascotas para reflejar los cambios
            this.cargarMascotas();
            resolve({ success: true, message: 'Foto eliminada exitosamente' });
          } else {
            const errorMessage = response.message || 'Error al eliminar la foto';
            this._error.set(errorMessage);
            resolve({ success: false, message: errorMessage });
          }
          this._isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error al eliminar foto:', error);
          const errorMessage = error.error?.message || error.message || 'Error al eliminar la foto';
          this._error.set(errorMessage);
          this._isLoading.set(false);
          resolve({ success: false, message: errorMessage });
        }
      });
    });
  }
}

