import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cita, CitaResponse, InformacionMascotaSnapshot } from '../models/cita.model';
import { ICitaRepository } from '../../domain/interfaces/repositories/cita.repository.interface';
import { CitasApiService } from '../../../../core/services/citas-api.service';

@Injectable({
  providedIn: 'root'
})
export class CitaRepository implements ICitaRepository {
  constructor(private citasApiService: CitasApiService) {}

  /**
   * Parsea las notas de una cita para extraer diagnóstico, tratamiento e información de la mascota
   */
  private parsearNotas(notas: string | undefined): { diagnostico?: string; tratamiento?: string; informacionMascota?: InformacionMascotaSnapshot } {
    if (!notas) {
      return {};
    }
    
    try {
      const notasJson = JSON.parse(notas);
      const resultado: any = {};
      
      if (notasJson.diagnostico) {
        resultado.diagnostico = notasJson.diagnostico;
      }
      
      if (notasJson.tratamiento) {
        resultado.tratamiento = notasJson.tratamiento;
      }
      
      if (notasJson.informacionMascota) {
        // Asegurar que la edad sea un número si existe
        const infoMascota = { ...notasJson.informacionMascota };
        if (infoMascota.edad !== null && infoMascota.edad !== undefined) {
          infoMascota.edad = typeof infoMascota.edad === 'string' ? parseInt(infoMascota.edad, 10) : infoMascota.edad;
        }
        // Asegurar que fechaNacimiento sea una cadena válida o null
        if (infoMascota.fechaNacimiento === '' || infoMascota.fechaNacimiento === null || infoMascota.fechaNacimiento === undefined) {
          infoMascota.fechaNacimiento = undefined;
        }
        resultado.informacionMascota = infoMascota as InformacionMascotaSnapshot;
        console.log('CitaRepository - informacionMascota parseada:', resultado.informacionMascota);
        console.log('CitaRepository - fechaNacimiento:', resultado.informacionMascota.fechaNacimiento);
        console.log('CitaRepository - edad:', resultado.informacionMascota.edad);
      }
      
      return resultado;
    } catch (e) {
      console.error('CitaRepository - Error al parsear notas:', e);
      console.error('CitaRepository - Notas:', notas);
      // Si no es JSON válido, retornar objeto vacío
      return {};
    }
  }

  /**
   * Mapea una cita del backend agregando campos parseados de notas
   */
  private mapearCita(cita: any): Cita {
    const citaMapeada: Cita = {
      id: cita.id,
      mascotaId: cita.mascotaId,
      mascota: cita.mascota,
      mascotaFoto: cita.mascotaFoto || null,
      servicioId: cita.servicioId,
      servicio: cita.servicio,
      fecha: cita.fecha,
      hora: cita.hora,
      veterinarioId: cita.veterinarioId,
      veterinario: cita.veterinario,
      clienteId: cita.clienteId,
      cliente: cita.cliente,
      estado: cita.estado,
      notas: cita.notas,
      createdAt: cita.createdAt
    };
    
    // Log para debug
    if (cita.mascotaFoto) {
      console.log('CitaRepository - Cita con foto:', { mascota: cita.mascota, mascotaFoto: cita.mascotaFoto });
    }
    
    // Si la cita está completada, parsear las notas
    if (cita.estado === 'completada' && cita.notas) {
      const notasParseadas = this.parsearNotas(cita.notas);
      citaMapeada.diagnostico = notasParseadas.diagnostico;
      citaMapeada.tratamiento = notasParseadas.tratamiento;
      citaMapeada.informacionMascota = notasParseadas.informacionMascota;
    }
    
    return citaMapeada;
  }

  getCitasByCliente(clienteId: number): Observable<CitaResponse<Cita[]>> {
    console.log('CitaRepository - getCitasByCliente clienteId:', clienteId);
    
    return this.citasApiService.getCitas(clienteId).pipe(
      map((response: any): CitaResponse<Cita[]> => {
        console.log('CitaRepository - response:', response);
        console.log('CitaRepository - citas recibidas:', response.data?.length || 0);
        return {
          success: response.success,
          data: (response.data || []).map((cita: any) => this.mapearCita(cita)),
          message: response.message
        };
      }),
      catchError(error => {
        console.error('Error fetching citas:', error);
        return new Observable<CitaResponse<Cita[]>>(observer => {
          observer.next({ success: false, data: [], message: 'Error al cargar citas' });
          observer.complete();
        });
      })
    );
  }

  getCitasByMascota(mascotaId: number): Observable<CitaResponse<Cita[]>> {
    return this.citasApiService.getCitas(undefined, mascotaId).pipe(
      map((response: any): CitaResponse<Cita[]> => ({
        success: response.success,
        data: (response.data || []).map((cita: any) => this.mapearCita(cita)),
        message: response.message
      })),
      catchError(error => {
        console.error('Error fetching citas by mascota:', error);
        return new Observable<CitaResponse<Cita[]>>(observer => {
          observer.next({ success: false, data: [], message: 'Error al cargar citas' });
          observer.complete();
        });
      })
    );
  }

  getCitasByVeterinario(veterinarioId: number): Observable<CitaResponse<Cita[]>> {
    console.log('CitaRepository - getCitasByVeterinario veterinarioId:', veterinarioId);
    
    return this.citasApiService.getCitas(undefined, undefined, undefined, veterinarioId).pipe(
      map((response: any): CitaResponse<Cita[]> => {
        console.log('CitaRepository - response:', response);
        console.log('CitaRepository - citas recibidas:', response.data?.length || 0);
        return {
          success: response.success,
          data: (response.data || []).map((cita: any) => this.mapearCita(cita)),
          message: response.message
        };
      }),
      catchError(error => {
        console.error('Error fetching citas by veterinario:', error);
        return new Observable<CitaResponse<Cita[]>>(observer => {
          observer.next({ success: false, data: [], message: 'Error al cargar citas' });
          observer.complete();
        });
      })
    );
  }

  getCitaById(id: number): Observable<CitaResponse<Cita>> {
    return this.citasApiService.getCita(id).pipe(
      map((response: any): CitaResponse<Cita> => ({
        success: response.success,
        data: response.data ? this.mapearCita(response.data) : undefined,
        message: response.message
      })),
      catchError(error => {
        console.error('Error fetching cita by ID:', error);
        return new Observable<CitaResponse<Cita>>(observer => {
          observer.next({ success: false, message: 'Error al cargar cita' });
          observer.complete();
        });
      })
    );
  }
}

