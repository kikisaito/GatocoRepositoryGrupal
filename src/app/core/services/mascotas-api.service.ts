import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService, ApiResponse } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class MascotasApiService extends BaseApiService {
  
  /**
   * Obtiene todas las mascotas, opcionalmente filtradas por dueño
   */
  getMascotas(duenoId?: number): Observable<ApiResponse<any[]>> {
    let url = `${this.baseUrl}/mascotas`;
    if (duenoId) {
      url += `?duenoId=${duenoId}`;
    }
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getHeaders() });
  }

  /**
   * Obtiene una mascota por ID
   */
  getMascota(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/mascotas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crea una nueva mascota
   */
  createMascota(mascotaData: any): Observable<ApiResponse<any>> {
    console.log('MascotasApiService - createMascota - URL:', `${this.baseUrl}/mascotas`);
    console.log('MascotasApiService - createMascota - body:', mascotaData);
    
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/mascotas`,
      mascotaData,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualiza una mascota existente
   */
  updateMascota(id: number, mascotaData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/mascotas/${id}`,
      mascotaData,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Elimina una mascota
   */
  deleteMascota(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/mascotas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Sube o actualiza la foto de una mascota
   */
  uploadPhoto(id: number, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('photo', file);
    
    // Crear headers sin Content-Type para que el navegador lo establezca automáticamente con el boundary
    // Obtener token del localStorage directamente
    let headers = new HttpHeaders();
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers = headers.set('Authorization', token);
      }
    }
    
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/mascotas/${id}/foto`,
      formData,
      { headers }
    );
  }

  /**
   * Elimina la foto de una mascota
   */
  deletePhoto(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/mascotas/${id}/foto`,
      { headers: this.getHeaders() }
    );
  }
}

