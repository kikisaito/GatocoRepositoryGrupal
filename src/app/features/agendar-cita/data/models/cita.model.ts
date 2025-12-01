/**
 * Modelo de datos para Cita
 * Reutiliza el modelo de citas-historial
 */
export interface Cita {
  id: number;
  mascotaId: number;
  mascota: string;
  servicioId: number;
  servicio: string;
  fecha: string;
  hora: string;
  veterinarioId: number;
  veterinario: string;
  clienteId: number;
  cliente: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
  createdAt?: string;
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

