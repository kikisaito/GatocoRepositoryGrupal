import { Component, signal, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthContainerComponent } from '../../../../shared/layout/authcontainer/auth-container.component';
import { PageHeaderComponent } from '../../../../shared/layout/authcontainer/components/page-header/page-header.component';
import { ListadoMascotasComponent } from '../../components/listado-mascotas/listado-mascotas.component';
import { SeleccionarServicioComponent } from '../../components/seleccionar-servicio/seleccionar-servicio.component';
import { SeleccionarVeterinarioComponent } from '../../components/seleccionar-veterinario/seleccionar-veterinario.component';
import { SeleccionarFechaComponent } from '../../components/seleccionar-fecha/seleccionar-fecha.component';
import { ResumenCitaComponent } from '../../components/resumen-cita/resumen-cita.component';
import { ModalConfirmacionComponent } from '../../components/modal-confirmacion/modal-confirmacion.component';
import { ModalDetallesMascotaComponent } from '../../components/modal-detalles-mascota/modal-detalles-mascota.component';
import { BotonesAccionCitaComponent } from '../../components/botones-accion-cita/botones-accion-cita.component';
import { AlertaPersonalizadaComponent, TipoAlerta } from '../../components/alerta-personalizada/alerta-personalizada.component';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { CitasApiService } from '../../../../../core/services/citas-api.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [
    AuthContainerComponent, 
    PageHeaderComponent, 
    ListadoMascotasComponent, 
    SeleccionarServicioComponent,
    SeleccionarVeterinarioComponent,
    SeleccionarFechaComponent,
    ResumenCitaComponent,
    ModalConfirmacionComponent,
    ModalDetallesMascotaComponent,
    BotonesAccionCitaComponent,
    AlertaPersonalizadaComponent
  ],
  templateUrl: './agendar-cita.component.html',
  styleUrl: './agendar-cita.component.css'
})
export class AgendarCitaComponent {
  private router = inject(Router);
  private authContext = inject(AuthContext);
  private citasApiService = inject(CitasApiService);

  // Estado para controlar el paso actual (1, 2, 3 o 4)
  pasoActual = signal<number>(1);
  
  // Datos de la cita
  mascotaSeleccionada: Mascota | null = null;
  servicioSeleccionado: number | null = null;
  veterinarioSeleccionado: number | null = null;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  
  // Estado del modal
  mostrarModalConfirmacion = signal<boolean>(false);
  mostrarModalDetallesMascota = signal<boolean>(false);
  mascotaParaModal: Mascota | null = null;
  isConfirmando = signal<boolean>(false);
  
  // Estado de alerta personalizada
  mostrarAlerta = signal<boolean>(false);
  mensajeAlerta = signal<string>('');
  tipoAlerta = signal<TipoAlerta>('info');

  // Referencias a componentes hijos
  @ViewChild(ListadoMascotasComponent) listadoMascotasComponent!: ListadoMascotasComponent;
  @ViewChild(SeleccionarServicioComponent) seleccionarServicioComponent!: SeleccionarServicioComponent;
  @ViewChild(SeleccionarVeterinarioComponent) seleccionarVeterinarioComponent!: SeleccionarVeterinarioComponent;
  @ViewChild(SeleccionarFechaComponent) seleccionarFechaComponent!: SeleccionarFechaComponent;

  onMascotaSeleccionada(mascota: Mascota | null): void {
    if (mascota) {
      this.mascotaParaModal = mascota;
      this.mostrarModalDetallesMascota.set(true);
    }
  }

  onConfirmarMascota(): void {
    if (this.mascotaParaModal) {
      this.mascotaSeleccionada = this.mascotaParaModal;
      this.mostrarModalDetallesMascota.set(false);
      this.mascotaParaModal = null;
      // Pasar al siguiente paso (seleccionar servicio)
      this.pasoActual.set(2);
    }
  }

  onCancelarMascota(): void {
    this.mostrarModalDetallesMascota.set(false);
    this.mascotaParaModal = null;
  }

  onServicioSeleccionado(servicioId: number): void {
    this.servicioSeleccionado = servicioId;
    console.log('Servicio actualizado:', servicioId);
  }

  onVeterinarioSeleccionado(veterinarioId: number): void {
    this.veterinarioSeleccionado = veterinarioId;
    console.log('Veterinario actualizado:', veterinarioId);
  }

  onFechaRecibida(fecha: string): void {
    this.fechaSeleccionada = fecha;
    console.log('Fecha actualizada en componente padre:', fecha);
  }

  onHoraRecibida(hora: string): void {
    this.horaSeleccionada = hora;
    console.log('Hora actualizada en componente padre:', hora);
  }

  onSiguiente(): void {
    if (this.pasoActual() === 1) {
      // El paso 1 ya no tiene botón siguiente, se maneja desde el modal
      return;
    } else if (this.pasoActual() === 2) {
      // Validar que tenga servicio seleccionado
      if (this.servicioSeleccionado) {
        this.pasoActual.set(3);
      } else {
        this.mostrarAlertaPersonalizada('Por favor, selecciona un servicio', 'warning');
      }
    } else if (this.pasoActual() === 3) {
      // Validar que tenga veterinario seleccionado
      if (this.veterinarioSeleccionado) {
        this.pasoActual.set(4);
      } else {
        this.mostrarAlertaPersonalizada('Por favor, selecciona un veterinario', 'warning');
      }
    } else if (this.pasoActual() === 4) {
      // Validar que tenga fecha y hora seleccionadas
      console.log('Fecha:', this.fechaSeleccionada);
      console.log('Hora:', this.horaSeleccionada);
      if (this.fechaSeleccionada && this.horaSeleccionada) {
        this.pasoActual.set(5);
      } else {
        this.mostrarAlertaPersonalizada('Por favor, selecciona una fecha y hora', 'warning');
      }
    } else {
      // Paso 5 - Confirmar cita
      this.confirmarCita();
    }
  }

  onCancelar(): void {
    this.mostrarModalConfirmacion.set(true);
  }

  confirmarCancelacion(): void {
    this.limpiarDatos();
    this.router.navigate(['/dashboard']);
  }

  cancelarConfirmacion(): void {
    this.mostrarModalConfirmacion.set(false);
  }

  onAtras(): void {
    if (this.pasoActual() === 2) {
      this.pasoActual.set(1);
      this.mascotaSeleccionada = null;
    } else if (this.pasoActual() === 3) {
      this.pasoActual.set(2);
      this.servicioSeleccionado = null;
    } else if (this.pasoActual() === 4) {
      this.pasoActual.set(3);
      this.veterinarioSeleccionado = null;
    } else if (this.pasoActual() === 5) {
      this.pasoActual.set(4);
      this.fechaSeleccionada = '';
      this.horaSeleccionada = '';
    }
  }

  confirmarCita(): void {
    if (!this.mascotaSeleccionada || !this.servicioSeleccionado || !this.veterinarioSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
      this.mostrarAlertaPersonalizada('Por favor, completa todos los campos de la cita', 'warning');
      return;
    }

    const currentUser = this.authContext.getCurrentUser();
    if (!currentUser) {
      this.mostrarAlertaPersonalizada('Error: Usuario no autenticado', 'error');
      return;
    }

    this.isConfirmando.set(true);
    
    const citaData = {
      mascotaId: this.mascotaSeleccionada.id,
      servicioId: this.servicioSeleccionado,
      veterinarioId: this.veterinarioSeleccionado,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      clienteId: currentUser.id
    };

    console.log('Confirmando cita con datos:', citaData);

    this.citasApiService.createCita(citaData).subscribe({
      next: (response) => {
        console.log('Cita creada exitosamente:', response);
        if (response.success) {
          this.limpiarDatos();
          this.router.navigate(['/dashboard'], { queryParams: { citaConfirmada: 'true' } });
        } else {
          this.mostrarAlertaPersonalizada(response.message || 'Error al confirmar la cita', 'error');
          this.isConfirmando.set(false);
        }
      },
      error: (error) => {
        console.error('Error al confirmar cita:', error);
        const mensajeError = error.error?.message || error.message || 'Error al confirmar la cita. Por favor, intenta nuevamente.';
        this.mostrarAlertaPersonalizada(mensajeError, 'error');
        this.isConfirmando.set(false);
      }
    });
  }

  mostrarAlertaPersonalizada(mensaje: string, tipo: TipoAlerta = 'info'): void {
    this.mensajeAlerta.set(mensaje);
    this.tipoAlerta.set(tipo);
    this.mostrarAlerta.set(true);
    
    // Auto-cerrar después de 4 segundos para success, 5 segundos para otros tipos
    const tiempo = tipo === 'success' ? 4000 : 5000;
    setTimeout(() => {
      this.cerrarAlerta();
    }, tiempo);
  }

  cerrarAlerta(): void {
    this.mostrarAlerta.set(false);
    this.mensajeAlerta.set('');
  }

  limpiarDatos(): void {
    this.pasoActual.set(1);
    this.mascotaSeleccionada = null;
    this.servicioSeleccionado = null;
    this.veterinarioSeleccionado = null;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
  }
}

