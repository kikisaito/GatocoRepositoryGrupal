import { Component, output, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ServiciosApiService } from '../../../../../core/services/servicios-api.service';

@Component({
  selector: 'app-seleccionar-servicio',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './seleccionar-servicio.component.html',
  styleUrl: './seleccionar-servicio.component.css'
})
export class SeleccionarServicioComponent implements OnInit {
  private serviciosApiService = inject(ServiciosApiService);
  private cdr = inject(ChangeDetectorRef);

  servicioSeleccionadoChange = output<number>();

  servicioSeleccionado: number | null = null;
  servicios: { id: number; name: string }[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.isLoading = true;
    
    console.log('SeleccionarServicioComponent - Cargando servicios...');
    
    this.serviciosApiService.getServicios().subscribe({
      next: (response) => {
        console.log('SeleccionarServicioComponent - Respuesta:', response);
        if (response.success && response.data) {
          // Mapear los servicios del backend (id y name)
          this.servicios = response.data.map((servicio: any) => ({
            id: servicio.id,
            name: servicio.name
          }));
          console.log('SeleccionarServicioComponent - Servicios cargados:', this.servicios);
        } else {
          console.warn('SeleccionarServicioComponent - Sin datos de servicios en la respuesta');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('SeleccionarServicioComponent - Error al cargar servicios:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onServicioChange(servicioId: number): void {
    console.log('Servicio seleccionado en componente:', servicioId);
    this.servicioSeleccionado = servicioId;
    this.servicioSeleccionadoChange.emit(this.servicioSeleccionado);
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

