import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, ApiResponse } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class CitasApiService extends BaseApiService {
  
  /**
   * Obtiene todas las citas, con filtros opcionales
   */
  getCitas(clienteId?: number, mascotaId?: number, estado?: string, veterinarioId?: number): Observable<ApiResponse<any[]>> {
    let url = `${this.baseUrl}/citas`;
    const params = new URLSearchParams();
    
    if (clienteId) params.append('clienteId', clienteId.toString());
    if (mascotaId) params.append('mascotaId', mascotaId.toString());
    if (estado) params.append('estado', estado);
    if (veterinarioId) params.append('veterinarioId', veterinarioId.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getHeaders() });
  }

  /**
   * Obtiene una cita específica por ID
   */
  getCita(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/citas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crea una nueva cita
   */
  createCita(citaData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/citas`,
      citaData,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualiza una cita existente
   */
  updateCita(id: number, citaData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/citas/${id}`,
      citaData,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Elimina una cita
   */
  deleteCita(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/citas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualiza el estado de una cita
   */
  updateCitaEstado(id: number, estado: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/citas/${id}/estado?estado=${estado}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cancela una cita
   */
  cancelCita(id: number): Observable<ApiResponse<any>> {
    return this.updateCitaEstado(id, 'cancelada');
  }

  /**
   * Atiende una cita (actualiza con diagnóstico y tratamiento)
   */
  atenderCita(id: number, diagnostico: string, tratamiento: string, informacionMascota?: any): Observable<ApiResponse<any>> {
    const citaData: any = {
      diagnostico,
      tratamiento,
      estado: 'completada'
    };
    
    // Agregar información de la mascota si se proporciona
    if (informacionMascota) {
      citaData.informacionMascota = informacionMascota;
    }
    
    return this.updateCita(id, citaData);
  }
}

