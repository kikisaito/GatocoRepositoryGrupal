import { Observable } from 'rxjs';
import { Cita, CitaResponse } from '../../../data/models/cita.model';

export interface ICitaRepository {
  getCitasByCliente(clienteId: number): Observable<CitaResponse<Cita[]>>;
  getCitasByVeterinario(veterinarioId: number): Observable<CitaResponse<Cita[]>>;
  getCitasByMascota(mascotaId: number): Observable<CitaResponse<Cita[]>>;
  getCitaById(id: number): Observable<CitaResponse<Cita>>;
}

