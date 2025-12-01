import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, ApiResponse } from './base-api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthApiService extends BaseApiService {

    /**
     * Endpoint para login
     */
    login(email: string, password: string): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            `${this.baseUrl}/auth/clients/login`,
            { email, password },
            { headers: this.getHeaders() }
        );
    }

    /**
     * Endpoint para registro
     */
    register(userData: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            `${this.baseUrl}/auth/clients/register`,
            userData,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Endpoint para logout
     */
    logout(): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            `${this.baseUrl}/auth/logout`,
            {},
            { headers: this.getHeaders() }
        );
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(
            `${this.baseUrl}/auth/me`,
            { headers: this.getHeaders() }
        );
    }
}
