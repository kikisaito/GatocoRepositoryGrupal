import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MascotaResponse } from '../../data/models/mascota.model';
import { IMascotaRepository } from '../interfaces/repositories/mascota.repository.interface';
import { MASCOTA_REPOSITORY_TOKEN } from '../interfaces/tokens';

/**
 * DeleteMascotaUseCase - Caso de uso para eliminar mascotas
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio para eliminar mascotas
 */
@Injectable({
  providedIn: 'root'
})
export class DeleteMascotaUseCase {
  constructor(
    @Inject(MASCOTA_REPOSITORY_TOKEN) private mascotaRepository: IMascotaRepository
  ) {}

  /**
   * Ejecuta el caso de uso de eliminación de mascota
   * @param id ID de la mascota a eliminar
   * @returns Observable con la respuesta
   */
  execute(id: number): Observable<MascotaResponse<boolean>> {
    console.log('DeleteMascotaUseCase - ID recibido:', id);
    
    // Validaciones de entrada
    if (!id || id <= 0) {
      console.log('Validación falló: ID inválido');
      return new Observable<MascotaResponse<boolean>>(observer => {
        observer.next({
          success: false,
          data: false,
          message: 'El ID de la mascota es requerido'
        });
        observer.complete();
      });
    }

    console.log('Validaciones pasadas, llamando al repository para eliminar');

    // Ejecutar eliminación de mascota
    return this.mascotaRepository.deleteMascota(id);
  }
}

