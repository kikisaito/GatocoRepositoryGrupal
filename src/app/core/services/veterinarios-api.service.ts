import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, ApiResponse } from './base-api.service';

export interface Veterinario {
  id: number;
  userId: number;
  fullName: string;
  phone: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VeterinariosApiService extends BaseApiService {
  
  /**
   * Obtiene todos los veterinarios disponibles
   */
  getVeterinarios(): Observable<ApiResponse<Veterinario[]>> {
    return this.http.get<ApiResponse<Veterinario[]>>(
      `${this.baseUrl}/veterinarios`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtiene un veterinario específico por ID
   */
  getVeterinario(id: number): Observable<ApiResponse<Veterinario>> {
    return this.http.get<ApiResponse<Veterinario>>(
      `${this.baseUrl}/veterinarios/${id}`,
      { headers: this.getHeaders() }
    );
  }
}


