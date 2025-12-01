import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { Cita } from '../../../../citas-historial/data/models/cita.model';
import { GetCitasUseCase } from '../../../../citas-historial/domain/usecases/get-citas.usecase';
import { CitasApiService } from '../../../../../core/services/citas-api.service';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { AlertaPersonalizadaComponent, TipoAlerta } from '../../../../agendar-cita/presentation/components/alerta-personalizada/alerta-personalizada.component';
import { ModalConfirmacionComponent } from '../../../../agendar-cita/presentation/components/modal-confirmacion/modal-confirmacion.component';
import { ModalAtenderCitaComponent } from '../modal-atender-cita/modal-atender-cita.component';

@Component({
  selector: 'app-citas-pendientes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    AlertaPersonalizadaComponent,
    ModalConfirmacionComponent,
    ModalAtenderCitaComponent
  ],
  templateUrl: './citas-pendientes.component.html',
  styleUrl: './citas-pendientes.component.css'
})
export class CitasPendientesComponent implements OnInit {
  private getCitasUseCase = inject(GetCitasUseCase);
  private citasApiService = inject(CitasApiService);
  private authContext = inject(AuthContext);

  @Output() citasActualizadas = new EventEmitter<void>();

  isVeterinario = signal<boolean>(false);
  displayedColumns: string[] = ['mascota', 'servicio', 'fecha', 'hora', 'acciones'];
  
  // Texto dinámico para el header de la columna mascota/paciente
  headerColumnaMascota = computed(() => {
    return this.isVeterinario() ? 'Paciente' : 'Mascota';
  });
  
  currentPage = signal<number>(1);
  itemsPerPage: number = 5;
  
  // Datos reales de citas con Signals
  allCitas = signal<Cita[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Signals para alerta y modal de confirmación
  mostrarAlerta = signal<boolean>(false);
  mensajeAlerta = signal<string>('');
  tipoAlerta = signal<TipoAlerta>('info');
  mostrarModalConfirmacion = signal<boolean>(false);
  citaACancelar = signal<Cita | null>(null);
  
  // Signals para modal de atender cita
  mostrarModalAtender = signal<boolean>(false);
  citaAAtender = signal<Cita | null>(null);
  
  ngOnInit(): void {
    const currentUser = this.authContext.getCurrentUser();
    this.isVeterinario.set(currentUser?.role === 'veterinario');
    
    // Suscribirse a cambios del usuario
    this.authContext.currentUser$.subscribe(user => {
      this.isVeterinario.set(user?.role === 'veterinario');
    });
    
    this.cargarCitas();
  }
  
  cargarCitas(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.getCitasUseCase.execute().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrar solo citas pendientes
          const citasPendientes = response.data.filter(cita => cita.estado === 'pendiente');
          console.log('Citas pendientes con fotos:', citasPendientes.map(c => ({ mascota: c.mascota, mascotaFoto: c.mascotaFoto })));
          this.allCitas.set(citasPendientes);
        } else {
          this.error.set(response.message || 'Error al cargar citas');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.error.set('Error al cargar las citas');
        this.isLoading.set(false);
      }
    });
  }

  // Propiedades calculadas para paginación con Signals
  totalPages = computed(() => {
    return Math.ceil(this.allCitas().length / this.itemsPerPage);
  });

  paginatedCitas = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allCitas().slice(start, end);
  });

  // DataSource para Material Table
  get dataSource(): Cita[] {
    return this.paginatedCitas();
  }

  visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    const total = this.totalPages();
    const current = this.currentPage();
    
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  });

  startIndex = computed(() => {
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  });

  endIndex = computed(() => {
    const end = this.currentPage() * this.itemsPerPage;
    return Math.min(end, this.allCitas().length);
  });

  totalCitas = computed(() => {
    return this.allCitas().length;
  });

  // Métodos de navegación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.scrollToTop();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getHoraFormateada12h(hora24: string): string {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    const hora = parseInt(horas, 10);
    const periodo = hora >= 12 ? 'PM' : 'AM';
    let hora12 = hora % 12;
    if (hora12 === 0) hora12 = 12;
    return `${hora12}:${minutos} ${periodo}`;
  }

  puedeCancelar(cita: Cita): boolean {
    return cita.estado === 'pendiente';
  }

  cancelarCita(cita: Cita): void {
    // Mostrar modal de confirmación
    this.citaACancelar.set(cita);
    this.mostrarModalConfirmacion.set(true);
  }

  confirmarCancelacion(): void {
    const cita = this.citaACancelar();
    if (!cita) {
      return;
    }

    this.mostrarModalConfirmacion.set(false);
    this.isLoading.set(true);
    
    this.citasApiService.cancelCita(cita.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Recargar las citas para reflejar el cambio
          this.cargarCitas();
          // Notificar que las citas se actualizaron para que otros componentes se actualicen
          this.citasActualizadas.emit();
          this.mostrarAlertaPersonalizada('Cita cancelada exitosamente', 'success');
        } else {
          this.mostrarAlertaPersonalizada(response.message || 'Error al cancelar la cita', 'error');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al cancelar cita:', error);
        const errorMessage = error.error?.message || error.message || 'Error al cancelar la cita';
        this.mostrarAlertaPersonalizada(errorMessage, 'error');
        this.isLoading.set(false);
      }
    });
    
    this.citaACancelar.set(null);
  }

  cancelarConfirmacion(): void {
    this.mostrarModalConfirmacion.set(false);
    this.citaACancelar.set(null);
  }

  atenderCita(cita: Cita): void {
    // Solo veterinarios pueden atender citas
    if (!this.isVeterinario()) {
      console.warn('Solo los veterinarios pueden atender citas');
      return;
    }
    
    this.citaAAtender.set(cita);
    this.mostrarModalAtender.set(true);
  }

  cerrarModalAtender(): void {
    this.mostrarModalAtender.set(false);
    this.citaAAtender.set(null);
  }

  guardarAtencionCita(datos: { diagnostico: string; tratamiento: string; informacionMascota?: any }): void {
    const cita = this.citaAAtender();
    if (!cita) {
      return;
    }

    this.isLoading.set(true);
    
    this.citasApiService.atenderCita(cita.id, datos.diagnostico, datos.tratamiento, datos.informacionMascota).subscribe({
      next: (response) => {
        if (response.success) {
          // Recargar las citas para reflejar el cambio
          this.cargarCitas();
          // Notificar que las citas se actualizaron para que otros componentes se actualicen
          this.citasActualizadas.emit();
          this.mostrarAlertaPersonalizada('Cita atendida exitosamente', 'success');
          this.cerrarModalAtender();
        } else {
          this.mostrarAlertaPersonalizada(response.message || 'Error al atender la cita', 'error');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al atender cita:', error);
        const errorMessage = error.error?.message || error.message || 'Error al atender la cita';
        this.mostrarAlertaPersonalizada(errorMessage, 'error');
        this.isLoading.set(false);
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
}

