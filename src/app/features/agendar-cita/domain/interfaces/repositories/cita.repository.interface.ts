import { Observable } from 'rxjs';
import { Cita, CitaResponse } from '../../../data/models/cita.model';

/**
 * Interface para el repositorio de citas
 * Define los contratos que debe cumplir el repositorio
 */
export interface ICitaRepository {
  createCita(citaData: any): Observable<CitaResponse<Cita>>;
  getCitaById(id: number): Observable<CitaResponse<Cita>>;
}

