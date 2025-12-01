import { Component, inject, OnInit, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { Cita } from '../../../data/models/cita.model';
import { GetCitasUseCase } from '../../../domain/usecases/get-citas.usecase';
import { CitasApiService } from '../../../../../core/services/citas-api.service';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { AlertaPersonalizadaComponent, TipoAlerta } from '../../../../agendar-cita/presentation/components/alerta-personalizada/alerta-personalizada.component';
import { ModalConfirmacionComponent } from '../../../../agendar-cita/presentation/components/modal-confirmacion/modal-confirmacion.component';
import { ModalDetallesCitaComponent } from '../modal-detalles-cita/modal-detalles-cita.component';

@Component({
  selector: 'app-table-citas',
  standalone: true,
      imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatMenuModule,
        AlertaPersonalizadaComponent, // usado en template
        ModalConfirmacionComponent, // usado en template
        ModalDetallesCitaComponent // usado en template
      ],
  templateUrl: './table-citas.component.html',
  styleUrl: './table-citas.component.css'
})
export class TableCitasComponent implements OnInit {
  private getCitasUseCase = inject(GetCitasUseCase);
  private citasApiService = inject(CitasApiService);
  private authContext = inject(AuthContext);

  @Input() soloPendientes: boolean = false; // Para mostrar solo citas pendientes en dashboard de veterinario
  
  isVeterinario = signal<boolean>(false);

  displayedColumns: string[] = ['mascota', 'servicio', 'fecha', 'hora', 'estado', 'acciones'];
  
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
  mascotaFiltrada = signal<string | null>(null);
  estadoFiltrado = signal<string | null>(null);
  
  // Signals para alerta y modal de confirmación
  mostrarAlerta = signal<boolean>(false);
  mensajeAlerta = signal<string>('');
  tipoAlerta = signal<TipoAlerta>('info');
  mostrarModalConfirmacion = signal<boolean>(false);
  citaACancelar = signal<Cita | null>(null);
  
  // Signals para modal de detalles de cita completada
  mostrarModalDetalles = signal<boolean>(false);
  citaDetalles = signal<Cita | null>(null);
  
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
    console.log('TableCitasComponent - Iniciando carga de citas...');

    this.getCitasUseCase.execute().subscribe({
      next: (response) => {
        console.log('TableCitasComponent - Response recibida:', response);
        console.log('TableCitasComponent - Citas recibidas:', response.data?.length || 0);
        
        if (response.success && response.data) {
          console.log('TableCitasComponent - Guardando citas:', response.data);
          // Log para verificar fotos
          console.log('TableCitasComponent - Citas con fotos:', response.data.map((c: any) => ({ mascota: c.mascota, mascotaFoto: c.mascotaFoto })));
          // Filtrar solo citas pendientes si es para el dashboard de veterinario
          // (esto se puede hacer con un @Input() para reutilizar el componente)
          this.allCitas.set(response.data);
          console.log('TableCitasComponent - Citas guardadas. Total:', this.allCitas().length);
        } else {
          this.error.set(response.message || 'Error al cargar citas');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('TableCitasComponent - Error al cargar citas:', error);
        this.error.set('Error al cargar las citas');
        this.isLoading.set(false);
      }
    });
  }

  // Propiedades calculadas para el filtro con Signals
  citas = computed<Cita[]>(() => {
    const mascota = this.mascotaFiltrada();
    const estado = this.estadoFiltrado();
    let citas = this.allCitas();
    
    // Si soloPendientes es true, filtrar solo citas pendientes
    if (this.soloPendientes) {
      citas = citas.filter(cita => cita.estado === 'pendiente');
    }
    // Si es veterinario y no es solo pendientes (historial), excluir citas pendientes
    else if (this.isVeterinario() && !this.soloPendientes) {
      citas = citas.filter(cita => cita.estado !== 'pendiente');
    }
    // Si es cliente y no es solo pendientes (historial), mostrar solo canceladas y completadas
    else if (!this.isVeterinario() && !this.soloPendientes) {
      citas = citas.filter(cita => cita.estado === 'cancelada' || cita.estado === 'completada');
    }
    
    let citasFiltradas = citas;
    
    // Filtrar por mascota
    if (mascota) {
      citasFiltradas = citasFiltradas.filter(cita => cita.mascota === mascota);
    }
    
    // Filtrar por estado
    if (estado) {
      citasFiltradas = citasFiltradas.filter(cita => cita.estado === estado);
    }
    
    return citasFiltradas;
  });

  mascotasUnicas = computed<string[]>(() => {
    let citas = this.allCitas();
    
    // Si soloPendientes es true, usar solo citas pendientes para las mascotas únicas
    if (this.soloPendientes) {
      citas = citas.filter(cita => cita.estado === 'pendiente');
    }
    // Si es veterinario y no es solo pendientes (historial), excluir citas pendientes
    else if (this.isVeterinario() && !this.soloPendientes) {
      citas = citas.filter(cita => cita.estado !== 'pendiente');
    }
    // Si es cliente y no es solo pendientes (historial), usar solo canceladas y completadas
    else if (!this.isVeterinario() && !this.soloPendientes) {
      citas = citas.filter(cita => cita.estado === 'cancelada' || cita.estado === 'completada');
    }
    
    const mascotas = citas.map(cita => cita.mascota);
    return [...new Set(mascotas)].sort();
  });

  // Métodos para el filtro
  onMascotaSeleccionada(mascota: string | null): void {
    this.mascotaFiltrada.set(mascota);
    this.currentPage.set(1); // Resetear a la primera página
    this.scrollToTop();
  }

  onEstadoSeleccionado(estado: string | null): void {
    this.estadoFiltrado.set(estado);
    this.currentPage.set(1); // Resetear a la primera página
    this.scrollToTop();
  }

  // Propiedades calculadas para paginación con Signals
  totalPages = computed(() => {
    return Math.ceil(this.citas().length / this.itemsPerPage);
  });

  paginatedCitas = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.citas().slice(start, end);
  });

  // DataSource para Material Table (necesita ser un array, no una función)
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
    return Math.min(end, this.citas().length);
  });

  totalCitas = computed(() => {
    return this.citas().length;
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

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'estado-completada';
      case 'pendiente':
        return 'estado-pendiente';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return '';
    }
  }

  getEstadoChipClass(estado: string): string {
    return this.getEstadoClass(estado);
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
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

  verDetalles(cita: Cita): void {
    if (cita.estado === 'completada') {
      this.citaDetalles.set(cita);
      this.mostrarModalDetalles.set(true);
    }
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles.set(false);
    this.citaDetalles.set(null);
  }

  cancelarCita(cita: Cita): void {
    if (!this.puedeCancelar(cita)) {
      return;
    }

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

