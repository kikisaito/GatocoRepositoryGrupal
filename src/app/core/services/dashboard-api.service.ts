import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, ApiResponse } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService extends BaseApiService {
  
  /**
   * Obtiene los datos del dashboard para un cliente específico
   */
  getDashboard(clienteId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/dashboard/${clienteId}`,
      { headers: this.getHeaders() }
    );
  }
}

