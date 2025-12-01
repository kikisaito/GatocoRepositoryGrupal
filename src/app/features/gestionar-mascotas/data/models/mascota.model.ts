/**
 * Modelo de datos para Mascota
 */
export interface Mascota {
  id: number;
  nombre: string;
  especie: string; // Campo de texto libre
  raza: string;
  edad?: number;
  fechaNacimiento: string;
  sexo: 'macho' | 'hembra';
  duenoId: number;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request para crear una mascota
 * Solo contiene los campos del formulario
 */
export interface CreateMascotaRequest {
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string;
  sexo: 'macho' | 'hembra';
}

/**
 * Request para actualizar una mascota
 */
export interface UpdateMascotaRequest {
  nombre?: string;
  especie?: string;
  raza?: string;
  fechaNacimiento?: string;
  sexo?: 'macho' | 'hembra';
}

/**
 * Response de la API
 */
export interface MascotaResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

