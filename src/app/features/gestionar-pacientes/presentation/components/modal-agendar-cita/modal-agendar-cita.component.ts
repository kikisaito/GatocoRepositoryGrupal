import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { CitasApiService } from '../../../../../core/services/citas-api.service';
import { ServiciosApiService } from '../../../../../core/services/servicios-api.service';
import { VeterinariosApiService } from '../../../../../core/services/veterinarios-api.service';
import { AuthContext } from '../../../../../core/utils/authcontext';

@Component({
  selector: 'app-modal-agendar-cita',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modal-agendar-cita.component.html',
  styleUrl: './modal-agendar-cita.component.css'
})
export class ModalAgendarCitaComponent implements OnInit {
  @Input() paciente: Mascota | null = null;
  @Output() citaCreada = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  private citasApiService = inject(CitasApiService);
  private serviciosApiService = inject(ServiciosApiService);
  private veterinariosApiService = inject(VeterinariosApiService);
  private authContext = inject(AuthContext);

  fechaSeleccionada: Date | null = null;
  fechaSeleccionadaString: string = '';
  horaSeleccionada: string = '';
  fechaMinima: Date = this.obtenerFechaMinima();
  isCreating = signal<boolean>(false);
  error = signal<string | null>(null);

  // Horas disponibles en formato de 24 horas (para el backend)
  horasDisponibles24h: string[] = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30',
    '22:00'
  ];

  // Horas disponibles en formato de 12 horas (para mostrar)
  horasDisponibles: { value: string; display: string }[] = this.generarHoras12h();

  ngOnInit(): void {
    // El componente está listo
  }

  generarHoras12h(): { value: string; display: string }[] {
    return this.horasDisponibles24h.map(hora24 => {
      const [horas, minutos] = hora24.split(':');
      const hora = parseInt(horas, 10);
      const periodo = hora >= 12 ? 'PM' : 'AM';
      let hora12 = hora % 12;
      if (hora12 === 0) hora12 = 12;
      return {
        value: hora24, // Mantener formato 24h para el backend
        display: `${hora12}:${minutos} ${periodo}` // Mostrar formato 12h
      };
    });
  }

  obtenerFechaMinima(): Date {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(0, 0, 0, 0);
    return mañana;
  }

  onFechaChange(value: Date | null): void {
    this.fechaSeleccionada = value;
    if (value) {
      // Convertir Date a string formato YYYY-MM-DD
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      this.fechaSeleccionadaString = `${year}-${month}-${day}`;
    } else {
      this.fechaSeleccionadaString = '';
    }
  }

  onHoraChange(value: string): void {
    this.horaSeleccionada = value;
  }

  getFechaFormateada(fecha: Date | null): string {
    if (!fecha) return '';
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Filtro para permitir solo días laborables (lunes a viernes)
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDay();
    // 0 = domingo, 1 = lunes, ..., 5 = viernes, 6 = sábado
    // Permitir solo lunes (1) a viernes (5)
    return day >= 1 && day <= 5;
  };

  async crearCita(): Promise<void> {
    if (!this.paciente || !this.fechaSeleccionadaString || !this.horaSeleccionada) {
      this.error.set('Por favor, completa todos los campos');
      return;
    }

    this.isCreating.set(true);
    this.error.set(null);

    try {
      // Obtener el ID del servicio "Consulta General"
      const serviciosResponse = await this.serviciosApiService.getServicios().toPromise();
      if (!serviciosResponse?.success || !serviciosResponse.data) {
        throw new Error('Error al cargar servicios');
      }

      const consultaGeneral = serviciosResponse.data.find((s: any) => 
        s.name?.toLowerCase().includes('consulta general') || 
        s.name?.toLowerCase().includes('consulta general')
      );

      if (!consultaGeneral) {
        throw new Error('No se encontró el servicio "Consulta General"');
      }

      // Obtener el ID del veterinario desde el usuario actual
      const currentUser = this.authContext.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const veterinariosResponse = await this.veterinariosApiService.getVeterinarios().toPromise();
      if (!veterinariosResponse?.success || !veterinariosResponse.data) {
        throw new Error('Error al cargar veterinarios');
      }

      const veterinario = veterinariosResponse.data.find((v: any) => v.userId === currentUser.id);
      if (!veterinario) {
        throw new Error('No se encontró el veterinario asociado al usuario');
      }

      // Crear la cita
      // El backend ahora acepta tanto userId como clientId
      // Enviamos duenoId que es el clientId del dueño de la mascota
      const citaData = {
        mascotaId: this.paciente.id,
        servicioId: consultaGeneral.id,
        veterinarioId: veterinario.id,
        fecha: this.fechaSeleccionadaString,
        hora: this.horaSeleccionada,
        duenoId: this.paciente.duenoId
      };

      this.citasApiService.createCita(citaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.citaCreada.emit();
          } else {
            this.error.set(response.message || 'Error al crear la cita');
            this.isCreating.set(false);
          }
        },
        error: (error) => {
          console.error('Error al crear cita:', error);
          this.error.set(error.error?.message || error.message || 'Error al crear la cita');
          this.isCreating.set(false);
        }
      });
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      this.error.set(error.message || 'Error al crear la cita');
      this.isCreating.set(false);
    }
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}

