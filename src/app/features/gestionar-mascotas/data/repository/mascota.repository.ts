import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Mascota, CreateMascotaRequest, UpdateMascotaRequest, MascotaResponse } from '../models/mascota.model';
import { IMascotaRepository } from '../../domain/interfaces/repositories/mascota.repository.interface';
import { MascotasApiService } from '../../../../core/services/mascotas-api.service';

/**
 * Implementación del repositorio de mascotas
 * Usa el ApiService especializado para hacer llamadas al backend
 */
@Injectable({
  providedIn: 'root'
})
export class MascotaRepository implements IMascotaRepository {
  constructor(private mascotasApiService: MascotasApiService) {}

  getMascotasByDuenoId(duenoId: number): Observable<MascotaResponse<Mascota[]>> {
    return this.mascotasApiService.getMascotas(duenoId).pipe(
      map((response: any): MascotaResponse<Mascota[]> => ({
        success: response.success,
        data: response.data || [],
        message: response.message
      })),
      catchError(error => {
        console.error('Error getting mascotas:', error);
        return new Observable<MascotaResponse<Mascota[]>>(observer => {
          observer.next({
            success: false,
            data: [],
            message: 'Error al obtener mascotas'
          });
          observer.complete();
        });
      })
    );
  }

  getMascotaById(id: number): Observable<MascotaResponse<Mascota>> {
    return this.mascotasApiService.getMascota(id).pipe(
      map((response: any): MascotaResponse<Mascota> => ({
        success: response.success,
        data: response.data,
        message: response.message
      })),
      catchError(error => {
        console.error('Error getting mascota:', error);
        return new Observable<MascotaResponse<Mascota>>(observer => {
          observer.next({
            success: false,
            message: 'Error al obtener la mascota'
          });
          observer.complete();
        });
      })
    );
  }

  createMascota(mascotaData: CreateMascotaRequest, duenoId: number): Observable<MascotaResponse<Mascota>> {
    // Agregar duenoId al request
    const requestData = {
      ...mascotaData,
      duenoId
    };
    
    console.log('MascotaRepository - createMascota - requestData:', requestData);

    return this.mascotasApiService.createMascota(requestData).pipe(
      map((response: any): MascotaResponse<Mascota> => ({
        success: response.success,
        data: response.data,
        message: response.message
      })),
      catchError(error => {
        console.error('Error creating mascota:', error);
        return new Observable<MascotaResponse<Mascota>>(observer => {
          observer.next({
            success: false,
            message: error.error?.message || 'Error al crear la mascota'
          });
          observer.complete();
        });
      })
    );
  }

  updateMascota(id: number, mascotaData: UpdateMascotaRequest): Observable<MascotaResponse<Mascota>> {
    return this.mascotasApiService.updateMascota(id, mascotaData).pipe(
      map((response: any): MascotaResponse<Mascota> => ({
        success: response.success,
        data: response.data,
        message: response.message
      })),
      catchError(error => {
        console.error('Error updating mascota:', error);
        return new Observable<MascotaResponse<Mascota>>(observer => {
          observer.next({
            success: false,
            message: 'Error al actualizar la mascota'
          });
          observer.complete();
        });
      })
    );
  }

  deleteMascota(id: number): Observable<MascotaResponse<boolean>> {
    return this.mascotasApiService.deleteMascota(id).pipe(
      map((response: any): MascotaResponse<boolean> => ({
        success: response.success,
        data: true,
        message: response.message
      })),
      catchError(error => {
        console.error('Error deleting mascota:', error);
        // Extraer el mensaje del error del backend
        const errorMessage = error.error?.message || error.message || 'Error al eliminar la mascota';
        return new Observable<MascotaResponse<boolean>>(observer => {
          observer.next({
            success: false,
            data: false,
            message: errorMessage
          });
          observer.complete();
        });
      })
    );
  }
}

