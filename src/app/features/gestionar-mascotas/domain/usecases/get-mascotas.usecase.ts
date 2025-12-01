import { Injectable, Inject, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota, MascotaResponse } from '../../data/models/mascota.model';
import { IMascotaRepository } from '../interfaces/repositories/mascota.repository.interface';
import { MASCOTA_REPOSITORY_TOKEN } from '../interfaces/tokens';
import { AuthContext } from '../../../../core/utils/authcontext';

/**
 * GetMascotasUseCase - Caso de uso para obtener mascotas
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio para obtener mascotas
 */
@Injectable({
  providedIn: 'root'
})
export class GetMascotasUseCase {
  private authContext = inject(AuthContext);

  constructor(
    @Inject(MASCOTA_REPOSITORY_TOKEN) private mascotaRepository: IMascotaRepository
  ) {}

  /**
   * Ejecuta el caso de uso de obtención de mascotas
   * @returns Observable con la lista de mascotas del usuario actual
   */
  execute(): Observable<MascotaResponse<Mascota[]>> {
    // Obtener el ID del usuario actual
    const currentUser = this.authContext.getCurrentUser();
    if (!currentUser) {
      return new Observable<MascotaResponse<Mascota[]>>(observer => {
        observer.next({
          success: false,
          data: [],
          message: 'Usuario no autenticado'
        });
        observer.complete();
      });
    }

    // Ejecutar obtención de mascotas - solo lógica de negocio
    return this.mascotaRepository.getMascotasByDuenoId(currentUser.id);
  }
}

