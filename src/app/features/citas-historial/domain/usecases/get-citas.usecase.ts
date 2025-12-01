import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita, CitaResponse } from '../../data/models/cita.model';
import { AuthContext } from '../../../../core/utils/authcontext';
import { CitaRepository } from '../../data/repository/cita.repository';

/**
 * GetCitasUseCase - Caso de uso para obtener citas
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio para obtener citas
 */
@Injectable({
  providedIn: 'root'
})
export class GetCitasUseCase {
  private authContext = inject(AuthContext);
  private citaRepository = inject(CitaRepository);

  /**
   * Ejecuta el caso de uso de obtención de citas
   * @returns Observable con la lista de citas del usuario actual
   */
  execute(): Observable<CitaResponse<Cita[]>> {
    // Obtener el ID del usuario actual
    const currentUser = this.authContext.getCurrentUser();
    console.log('GetCitasUseCase - currentUser:', currentUser);
    
    if (!currentUser) {
      return new Observable<CitaResponse<Cita[]>>(observer => {
        observer.next({
          success: false,
          data: [],
          message: 'Usuario no autenticado'
        });
        observer.complete();
      });
    }

    // Verificar el rol del usuario y usar el método apropiado
    if (currentUser.role === 'veterinario') {
      console.log('GetCitasUseCase - veterinarioId:', currentUser.id);
      return this.citaRepository.getCitasByVeterinario(currentUser.id);
    } else {
      console.log('GetCitasUseCase - clienteId:', currentUser.id);
      return this.citaRepository.getCitasByCliente(currentUser.id);
    }
  }
}

