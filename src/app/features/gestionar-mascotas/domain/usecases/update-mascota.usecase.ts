import { Injectable, Inject, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateMascotaRequest, MascotaResponse } from '../../data/models/mascota.model';
import { IMascotaRepository } from '../interfaces/repositories/mascota.repository.interface';
import { MASCOTA_REPOSITORY_TOKEN } from '../interfaces/tokens';

/**
 * UpdateMascotaUseCase - Caso de uso para actualizar mascotas
 * Responsabilidad ÚNICA: Ejecutar la lógica de negocio para actualizar mascotas
 */
@Injectable({
  providedIn: 'root'
})
export class UpdateMascotaUseCase {
  constructor(
    @Inject(MASCOTA_REPOSITORY_TOKEN) private mascotaRepository: IMascotaRepository
  ) {}

  /**
   * Ejecuta el caso de uso de actualización de mascota
   * @param id ID de la mascota a actualizar
   * @param mascotaData Datos de la mascota a actualizar
   * @returns Observable con la respuesta
   */
  execute(id: number, mascotaData: UpdateMascotaRequest): Observable<MascotaResponse<any>> {
    console.log('UpdateMascotaUseCase - Datos recibidos:', mascotaData);
    
    // Validaciones de entrada
    if (!id || id <= 0) {
      console.log('Validación falló: ID inválido');
      return new Observable<MascotaResponse<any>>(observer => {
        observer.next({
          success: false,
          message: 'El ID de la mascota es requerido'
        });
        observer.complete();
      });
    }

    // Validar que haya al menos un campo para actualizar
    if (!mascotaData.nombre && !mascotaData.especie) {
      console.log('Validación falló: no hay campos para actualizar');
      return new Observable<MascotaResponse<any>>(observer => {
        observer.next({
          success: false,
          message: 'Debe proporcionar al menos nombre o especie para actualizar'
        });
        observer.complete();
      });
    }

    // Validar fecha de nacimiento si se proporciona
    if (mascotaData.fechaNacimiento) {
      const fechaNacimiento = new Date(mascotaData.fechaNacimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaNacimiento.setHours(0, 0, 0, 0);
      
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

    // Ejecutar actualización de mascota
    return this.mascotaRepository.updateMascota(id, mascotaData);
  }
}

