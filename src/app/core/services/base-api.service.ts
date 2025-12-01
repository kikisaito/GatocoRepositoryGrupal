import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    token?: string;
    user?: T;
}

/**
 * Servicio base que contiene la lógica común para todos los servicios de API
 * Proporciona métodos para obtener headers y la URL base
 */
@Injectable({
    providedIn: 'root'
})
export class BaseApiService {
    protected http = inject(HttpClient);
    public baseUrl = environment.apiUrl;

    /**
     * Obtiene los headers HTTP con autenticación si existe token
     */
    protected getHeaders(): HttpHeaders {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const token = this.getToken();
        if (token) {
            headers = headers.set('Authorization', token);
        }

        return headers;
    }

    /**
     * Obtiene el token de autenticación del localStorage
     */
    private getToken(): string | null {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    }
}
