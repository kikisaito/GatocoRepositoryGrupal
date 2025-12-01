import { Component, Input, inject, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { ServiciosApiService } from '../../../../../core/services/servicios-api.service';
import { VeterinariosApiService } from '../../../../../core/services/veterinarios-api.service';

@Component({
  selector: 'app-resumen-cita',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './resumen-cita.component.html',
  styleUrl: './resumen-cita.component.css'
})
export class ResumenCitaComponent implements OnInit, OnChanges {
  private authContext = inject(AuthContext);
  private serviciosApiService = inject(ServiciosApiService);
  private veterinariosApiService = inject(VeterinariosApiService);
  private cdr = inject(ChangeDetectorRef);

  @Input() mascota: Mascota | null = null;
  @Input() fecha: string = '';
  @Input() hora: string = '';
  @Input() servicioId: number | null = null;
  @Input() veterinarioId: number | null = null;

  servicioNombre: string = '';
  veterinarioNombre: string = '';
  
  private serviciosCargados: boolean = false;
  private veterinariosCargados: boolean = false;
  private serviciosCache: any[] = [];
  private veterinariosCache: any[] = [];

  ngOnInit(): void {
    console.log('ResumenCitaComponent - ngOnInit - servicioId:', this.servicioId, 'veterinarioId:', this.veterinarioId);
    this.cargarDatos();
  }

  ngOnChanges(): void {
    console.log('ResumenCitaComponent - ngOnChanges - servicioId:', this.servicioId, 'veterinarioId:', this.veterinarioId);
    this.cargarDatos();
  }
  
  private cargarDatos(): void {
    // Cargar servicios si no se han cargado aún
    if (!this.serviciosCargados) {
      this.cargarServicios();
    } else if (this.servicioId) {
      // Si ya están cargados, buscar directamente en el cache
      this.buscarServicioEnCache();
    }
    
    // Cargar veterinarios si no se han cargado aún
    if (!this.veterinariosCargados) {
      this.cargarVeterinarios();
    } else if (this.veterinarioId) {
      // Si ya están cargados, buscar directamente en el cache
      this.buscarVeterinarioEnCache();
    }
  }
  
  private cargarServicios(): void {
    this.serviciosApiService.getServicios().subscribe({
      next: (response) => {
        console.log('ResumenCitaComponent - cargarServicios - respuesta:', response);
        if (response.success && response.data) {
          this.serviciosCache = response.data;
          this.serviciosCargados = true;
          if (this.servicioId) {
            this.buscarServicioEnCache();
          }
        }
      },
      error: (error) => {
        console.error('ResumenCitaComponent - Error al cargar servicios:', error);
        this.serviciosCargados = true; // Marcar como cargado para evitar reintentos infinitos
      }
    });
  }
  
  private cargarVeterinarios(): void {
    this.veterinariosApiService.getVeterinarios().subscribe({
      next: (response) => {
        console.log('ResumenCitaComponent - cargarVeterinarios - respuesta:', response);
        if (response.success && response.data) {
          this.veterinariosCache = response.data;
          this.veterinariosCargados = true;
          if (this.veterinarioId) {
            this.buscarVeterinarioEnCache();
          }
        }
      },
      error: (error) => {
        console.error('ResumenCitaComponent - Error al cargar veterinarios:', error);
        this.veterinariosCargados = true; // Marcar como cargado para evitar reintentos infinitos
      }
    });
  }
  
  private buscarServicioEnCache(): void {
    if (!this.servicioId) return;
    
    console.log('ResumenCitaComponent - buscarServicioEnCache - buscando id:', this.servicioId);
    const servicio = this.serviciosCache.find((s: any) => Number(s.id) === Number(this.servicioId));
    console.log('ResumenCitaComponent - buscarServicioEnCache - servicio encontrado:', servicio);
    this.servicioNombre = servicio?.name || 'Servicio no encontrado';
    this.cdr.detectChanges();
  }
  
  private buscarVeterinarioEnCache(): void {
    if (!this.veterinarioId) return;
    
    console.log('ResumenCitaComponent - buscarVeterinarioEnCache - buscando id:', this.veterinarioId);
    const veterinario = this.veterinariosCache.find((v: any) => Number(v.id) === Number(this.veterinarioId));
    console.log('ResumenCitaComponent - buscarVeterinarioEnCache - veterinario encontrado:', veterinario);
    this.veterinarioNombre = veterinario?.fullName || 'Veterinario no encontrado';
    this.cdr.detectChanges();
  }


  getClienteNombre(): string {
    const usuario = this.authContext.getCurrentUser();
    return usuario?.fullName || 'No disponible';
  }

  getFechaFormateada(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha + 'T00:00:00');
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getEdad(fechaNacimiento: string | undefined): string {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad > 0 ? `${edad} años` : 'Menos de un año';
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

  getIconoPorServicio(nombreServicio: string): string {
    const nombre = nombreServicio.toLowerCase().trim();
    
    if (nombre.includes('consulta general') || nombre.includes('consulta')) {
      return 'medical_services';
    } else if (nombre.includes('vacunación') || nombre.includes('vacuna')) {
      return 'vaccines';
    } else if (nombre.includes('emergencia') || nombre.includes('emergency')) {
      return 'emergency';
    } else if (nombre.includes('baño') || nombre.includes('corte') || nombre.includes('bano')) {
      return 'content_cut';
    }
    
    // Icono por defecto
    return 'medical_services';
  }
}

