import { Observable } from 'rxjs';
import { Mascota, CreateMascotaRequest, UpdateMascotaRequest, MascotaResponse } from '../../../data/models/mascota.model';

/**
 * Interfaz para el repositorio de mascotas
 * Define el contrato que debe cumplir cualquier implementación de repositorio
 */
export interface IMascotaRepository {
  /**
   * Obtiene todas las mascotas de un usuario
   * @param duenoId ID del dueño
   * @returns Observable con la lista de mascotas
   */
  getMascotasByDuenoId(duenoId: number): Observable<MascotaResponse<Mascota[]>>;

  /**
   * Obtiene una mascota por ID
   * @param id ID de la mascota
   * @returns Observable con la mascota encontrada o null
   */
  getMascotaById(id: number): Observable<MascotaResponse<Mascota>>;

  /**
   * Crea una nueva mascota
   * @param mascotaData Datos de la mascota a crear
   * @param duenoId ID del dueño
   * @returns Observable con la mascota creada
   */
  createMascota(mascotaData: CreateMascotaRequest, duenoId: number): Observable<MascotaResponse<Mascota>>;

  /**
   * Actualiza una mascota existente
   * @param id ID de la mascota
   * @param mascotaData Datos a actualizar
   * @returns Observable con la mascota actualizada
   */
  updateMascota(id: number, mascotaData: UpdateMascotaRequest): Observable<MascotaResponse<Mascota>>;

  /**
   * Elimina una mascota
   * @param id ID de la mascota
   * @returns Observable con el resultado
   */
  deleteMascota(id: number): Observable<MascotaResponse<boolean>>;
}

