/**
 * Modelo de datos para Cita
 */
export interface Cita {
  id: number;
  mascotaId: number;
  mascota: string;
  mascotaFoto?: string | null; // Foto de la mascota
  servicioId: number;
  servicio: string;
  fecha: string;
  hora: string;
  veterinarioId: number;
  veterinario: string;
  clienteId: number;
  cliente: string;
  estado: 'pendiente' | 'cancelada' | 'completada';
  notas?: string;
  createdAt?: string;
  // Campos extraídos de notas para citas completadas
  diagnostico?: string;
  tratamiento?: string;
  informacionMascota?: InformacionMascotaSnapshot;
}

/**
 * Información de la mascota al momento de la consulta
 */
export interface InformacionMascotaSnapshot {
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  fechaNacimiento?: string;
  sexo?: string;
}

/**
 * Request para crear una cita
 */
export interface CreateCitaRequest {
  mascotaId: number;
  servicioId: number;
  fecha: string;
  hora: string;
  notas?: string;
}

/**
 * Response de la API
 */
export interface CitaResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

