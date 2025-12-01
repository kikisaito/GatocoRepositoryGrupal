import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICitaRepository } from '../interfaces/repositories/cita.repository.interface';
import { Cita, CitaResponse } from '../../data/models/cita.model';
import { AuthContext } from '../../../../core/utils/authcontext';
import { CitasApiService } from '../../../../core/services/citas-api.service';
import { map } from 'rxjs/operators';

/**
 * Use case para crear una nueva cita
 * Implementa la lógica de negocio para agendar citas
 */
@Injectable({
  providedIn: 'root'
})
export class CreateCitaUseCase {
  private citasApiService = inject(CitasApiService);
  private authContext = inject(AuthContext);

  /**
   * Ejecuta el caso de uso para crear una cita
   * @param citaData Datos de la cita a crear
   */
  execute(citaData: {
    mascotaId: number;
    servicioId: number;
    fecha: string;
    hora: string;
    notas?: string;
  }): Observable<CitaResponse<Cita>> {
    // Validar que el usuario esté autenticado
    const currentUser = this.authContext.getCurrentUser();
    if (!currentUser) {
      return new Observable(observer => {
        observer.next({
          success: false,
          message: 'Usuario no autenticado'
        });
        observer.complete();
      });
    }

    // Mapear servicio de texto a ID (esto debería venir del backend)
    const servicioIdMap: { [key: string]: number } = {
      'consulta-general': 1,
      'vacunacion': 2,
      'emergencia': 3,
      'bano-corte': 4,
      'cirugia-menor': 5,
      'control-postoperatorio': 6
    };

    const servicioIdNumerico = servicioIdMap[citaData.servicioId.toString()] || parseInt(citaData.servicioId.toString());

    // Preparar datos para la API
    const requestData = {
      mascotaId: citaData.mascotaId,
      servicioId: servicioIdNumerico,
      fecha: citaData.fecha,
      hora: citaData.hora,
      notas: citaData.notas || ''
    };

    console.log('CreateCitaUseCase - Datos de la cita:', requestData);
    console.log('CreateCitaUseCase - Usuario actual:', currentUser);

    // Llamar al servicio de API
    return this.citasApiService.createCita(requestData).pipe(
      map((response: any) => {
        console.log('CreateCitaUseCase - Respuesta del servidor:', response);
        return {
          success: response.success,
          data: response.data,
          message: response.message
        };
      })
    );
  }
}

