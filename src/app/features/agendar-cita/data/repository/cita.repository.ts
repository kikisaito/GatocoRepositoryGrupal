import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, CitaResponse } from '../models/cita.model';
import { ICitaRepository } from '../../domain/interfaces/repositories/cita.repository.interface';
import { CitasApiService } from '../../../../core/services/citas-api.service';

/**
 * Implementación del repositorio de citas
 * Accede a los servicios de API para operaciones de datos
 */
@Injectable({
  providedIn: 'root'
})
export class CitaRepository implements ICitaRepository {
  private citasApiService = inject(CitasApiService);

  /**
   * Crea una nueva cita
   * @param citaData Datos de la cita a crear
   */
  createCita(citaData: any): Observable<CitaResponse<Cita>> {
    return this.citasApiService.createCita(citaData).pipe(
      map((response: any): CitaResponse<Cita> => ({
        success: response.success,
        data: response.data,
        message: response.message
      }))
    );
  }

  /**
   * Obtiene una cita por ID
   * @param id ID de la cita
   */
  getCitaById(id: number): Observable<CitaResponse<Cita>> {
    return this.citasApiService.getCita(id).pipe(
      map((response: any): CitaResponse<Cita> => ({
        success: response.success,
        data: response.data,
        message: response.message
      }))
    );
  }
}

