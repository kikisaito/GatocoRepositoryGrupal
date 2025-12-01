import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { AuthContainerComponent } from '../../../../shared/layout/authcontainer/auth-container.component';
import { PageHeaderComponent } from '../../../../shared/layout/authcontainer/components/page-header/page-header.component';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { GetCitasUseCase } from '../../../../citas-historial/domain/usecases/get-citas.usecase';
import { Cita } from '../../../../citas-historial/data/models/cita.model';
import { MascotasApiService } from '../../../../../core/services/mascotas-api.service';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { ModalFichaPacienteComponent } from '../../components/modal-ficha-paciente/modal-ficha-paciente.component';
import { ModalAgendarCitaComponent } from '../../components/modal-agendar-cita/modal-agendar-cita.component';
import { ModalHistorialCitasComponent } from '../../components/modal-historial-citas/modal-historial-citas.component';

export interface PacienteTableRow {
  id: number;
  nombre: string;
  especie: string;
  propietario: string;
  paciente: Mascota;
}

@Component({
  selector: 'app-gestionar-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    AuthContainerComponent,
    PageHeaderComponent,
    ModalFichaPacienteComponent,
    ModalAgendarCitaComponent,
    ModalHistorialCitasComponent
  ],
  templateUrl: './gestionar-pacientes.component.html',
  styleUrl: './gestionar-pacientes.component.css'
})
export class GestionarPacientesComponent implements OnInit {
  private authContext = inject(AuthContext);
  private getCitasUseCase = inject(GetCitasUseCase);
  private mascotasApiService = inject(MascotasApiService);

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  citas = signal<Cita[]>([]);
  pacientes = signal<Mascota[]>([]);
  duenosMap = signal<Map<number, string>>(new Map());
  
  displayedColumns: string[] = ['paciente', 'especie', 'propietario', 'acciones'];
  dataSource = new MatTableDataSource<PacienteTableRow>([]);
  
  pacienteSeleccionado: Mascota | null = null;
  mostrarModalFicha = signal<boolean>(false);
  mostrarModalAgendarCita = signal<boolean>(false);
  mostrarModalHistorialCitas = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Obtener las citas del veterinario
    this.getCitasUseCase.execute().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.citas.set(response.data);
          
          // Crear un mapa de clienteId a nombre del cliente desde las citas
          const duenosMap = new Map<number, string>();
          response.data.forEach(cita => {
            if (cita.clienteId && cita.cliente) {
              duenosMap.set(cita.clienteId, cita.cliente);
            }
          });
          this.duenosMap.set(duenosMap);
          
          // Extraer IDs únicos de mascotas de las citas
          const mascotaIds = [...new Set(response.data.map(cita => cita.mascotaId))];
          
          // Cargar información de cada mascota
          this.cargarInformacionMascotas(mascotaIds);
        } else {
          this.error.set(response.message || 'Error al cargar pacientes');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.error.set('Error al cargar las citas');
        this.isLoading.set(false);
      }
    });
  }

  cargarInformacionMascotas(mascotaIds: number[]): void {
    if (mascotaIds.length === 0) {
      this.isLoading.set(false);
      return;
    }

    // Cargar información de cada mascota
    const promesas = mascotaIds.map(id => 
      this.mascotasApiService.getMascota(id).toPromise()
    );

    Promise.all(promesas).then(responses => {
      const pacientes: Mascota[] = [];
      
      responses.forEach((response, index) => {
        if (response?.success && response.data) {
          // Mapear campos del backend (inglés) al frontend (español)
          const mascotaBackend = response.data;
          const mascotaMapeada: Mascota = {
            id: mascotaBackend.id,
            nombre: mascotaBackend.name || mascotaBackend.nombre || '',
            especie: mascotaBackend.species || mascotaBackend.especie || '',
            raza: mascotaBackend.breed || mascotaBackend.raza || '',
            edad: mascotaBackend.age || mascotaBackend.edad,
            fechaNacimiento: mascotaBackend.birthDate || mascotaBackend.fechaNacimiento || '',
            sexo: (mascotaBackend.gender || mascotaBackend.sexo || 'macho') as 'macho' | 'hembra',
            duenoId: mascotaBackend.clientId || mascotaBackend.duenoId || 0,
            foto: mascotaBackend.photoUrl || mascotaBackend.foto || mascotaBackend.photo || null, // Priorizar photoUrl del backend
            createdAt: mascotaBackend.createdAt,
            updatedAt: mascotaBackend.updatedAt
          };
          pacientes.push(mascotaMapeada);
        }
      });

      this.pacientes.set(pacientes);
      this.actualizarTabla(pacientes);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error al cargar información de mascotas:', error);
      this.error.set('Error al cargar información de las mascotas');
      this.isLoading.set(false);
    });
  }

  actualizarTabla(pacientes: Mascota[]): void {
    const rows: PacienteTableRow[] = pacientes.map(paciente => ({
      id: paciente.id,
      nombre: paciente.nombre,
      especie: paciente.especie,
      propietario: this.getNombreDueno(paciente.duenoId),
      paciente: paciente
    }));
    this.dataSource.data = rows;
  }

  // Obtener citas de una mascota específica
  getCitasPorMascota(mascotaId: number): Cita[] {
    return this.citas().filter(cita => cita.mascotaId === mascotaId);
  }

  // Obtener nombre del dueño de una mascota
  getNombreDueno(duenoId: number): string {
    return this.duenosMap().get(duenoId) || 'Desconocido';
  }

  // Abrir modal de ficha del paciente
  abrirFicha(paciente: Mascota): void {
    this.pacienteSeleccionado = paciente;
    this.mostrarModalFicha.set(true);
  }

  // Cerrar modal de ficha
  cerrarFicha(): void {
    this.mostrarModalFicha.set(false);
    this.pacienteSeleccionado = null;
  }

  // Abrir modal de agendar cita
  abrirAgendarCita(paciente: Mascota): void {
    this.pacienteSeleccionado = paciente;
    this.mostrarModalAgendarCita.set(true);
  }


  // Cerrar modal de agendar cita
  cerrarAgendarCita(): void {
    this.mostrarModalAgendarCita.set(false);
    this.pacienteSeleccionado = null;
  }

  // Manejar cita creada exitosamente
  onCitaCreada(): void {
    this.cerrarAgendarCita();
    // Recargar pacientes para actualizar la tabla
    this.cargarPacientes();
  }

  // Abrir modal de historial de citas
  abrirHistorialCitas(paciente: Mascota): void {
    this.pacienteSeleccionado = paciente;
    this.mostrarModalHistorialCitas.set(true);
  }

  // Cerrar modal de historial de citas
  cerrarHistorialCitas(): void {
    this.mostrarModalHistorialCitas.set(false);
    this.pacienteSeleccionado = null;
  }

  // Obtener citas filtradas del paciente (solo canceladas y completadas)
  getCitasFiltradasPorMascota(mascotaId: number): Cita[] {
    return this.citas().filter(cita => 
      cita.mascotaId === mascotaId && 
      (cita.estado === 'cancelada' || cita.estado === 'completada')
    );
  }
}

