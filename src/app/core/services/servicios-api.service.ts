import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, ApiResponse } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ServiciosApiService extends BaseApiService {
  
  /**
   * Obtiene todos los servicios disponibles
   */
  getServicios(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/servicios`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtiene un servicio específico por ID
   */
  getServicio(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/servicios/${id}`,
      { headers: this.getHeaders() }
    );
  }
}

