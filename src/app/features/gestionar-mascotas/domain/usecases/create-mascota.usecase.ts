import { Injectable, Inject, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMascotaRequest, MascotaResponse } from '../../data/models/mascota.model';
import { IMascotaRepository } from '../interfaces/repositories/mascota.repository.interface';
import { MASCOTA_REPOSITORY_TOKEN } from '../interfaces/tokens';
import { AuthContext } from '../../../../core/utils/authcontext';

/**
 * CreateMascotaUseCase - Caso de uso para crear mascotas
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio para crear mascotas
 */
@Injectable({
  providedIn: 'root'
})
export class CreateMascotaUseCase {
  private authContext = inject(AuthContext);

  constructor(
    @Inject(MASCOTA_REPOSITORY_TOKEN) private mascotaRepository: IMascotaRepository
  ) {}

  /**
   * Ejecuta el caso de uso de creación de mascota
   * @param mascotaData Datos de la mascota a crear
   * @returns Observable con la respuesta
   */
  execute(mascotaData: CreateMascotaRequest): Observable<MascotaResponse<any>> {
    console.log('CreateMascotaUseCase - Datos recibidos:', mascotaData);
    
    // Validaciones de entrada
    if (!mascotaData.nombre || !mascotaData.especie || !mascotaData.sexo) {
      console.log('Validación falló: campos requeridos faltantes');
      return new Observable<MascotaResponse<any>>(observer => {
        observer.next({
          success: false,
          message: 'Nombre, especie y sexo son campos requeridos'
        });
        observer.complete();
      });
    }

    // Validar que el nombre no esté vacío
    if (mascotaData.nombre.trim().length === 0) {
      console.log('Validación falló: nombre vacío');
      return new Observable<MascotaResponse<any>>(observer => {
        observer.next({
          success: false,
          message: 'El nombre de la mascota es requerido'
        });
        observer.complete();
      });
    }

    // Validar fecha de nacimiento
    if (mascotaData.fechaNacimiento) {
      const fechaNacimiento = new Date(mascotaData.fechaNacimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      fechaNacimiento.setHours(0, 0, 0, 0);
      
      console.log('Validando fecha de nacimiento:', fechaNacimiento, 'vs hoy:', hoy);
      
      if (fechaNacimiento > hoy) {
        console.log('Validación falló: fecha en el futuro');
        return new Observable<MascotaResponse<any>>(observer => {
          observer.next({
            success: false,
            message: 'La fecha de nacimiento debe ser anterior a hoy'
          });
          observer.complete();
        });
      }
    }
    
    console.log('Validaciones pasadas, llamando al repository con datos:', mascotaData);

    // Obtener el ID del usuario actual
    const currentUser = this.authContext.getCurrentUser();
    if (!currentUser) {
      console.log('Usuario no autenticado');
      return new Observable<MascotaResponse<any>>(observer => {
        observer.next({
          success: false,
          message: 'Usuario no autenticado'
        });
        observer.complete();
      });
    }

    // Ejecutar creación de mascota - solo lógica de negocio
    return this.mascotaRepository.createMascota(mascotaData, currentUser.id);
  }
}

