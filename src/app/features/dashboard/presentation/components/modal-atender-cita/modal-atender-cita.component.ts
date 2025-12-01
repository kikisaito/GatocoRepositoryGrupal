import { Component, inject, Input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Cita } from '../../../../citas-historial/data/models/cita.model';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { MascotasApiService } from '../../../../../core/services/mascotas-api.service';

@Component({
  selector: 'app-modal-atender-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './modal-atender-cita.component.html',
  styleUrl: './modal-atender-cita.component.css'
})
export class ModalAtenderCitaComponent implements OnInit {
  @Input() cita: Cita | null = null;
  
  private fb = inject(FormBuilder);
  private mascotasApiService = inject(MascotasApiService);
  
  atenderForm!: FormGroup;
  mascota = signal<Mascota | null>(null);
  isLoading = signal<boolean>(false);
  isLoadingMascota = signal<boolean>(false);
  
  guardar = output<{ diagnostico: string; tratamiento: string; informacionMascota: any }>();
  cerrar = output<void>();
  
  ngOnInit(): void {
    this.atenderForm = this.fb.group({
      diagnostico: ['', [Validators.required]],
      tratamiento: ['', [Validators.required]]
    });
    
    if (this.cita?.mascotaId) {
      this.cargarDatosMascota(this.cita.mascotaId);
    }
  }
  
  cargarDatosMascota(mascotaId: number): void {
    this.isLoadingMascota.set(true);
    this.mascotasApiService.getMascota(mascotaId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
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
            foto: mascotaBackend.foto || mascotaBackend.photo || null,
            createdAt: mascotaBackend.createdAt,
            updatedAt: mascotaBackend.updatedAt
          };
          this.mascota.set(mascotaMapeada);
        }
        this.isLoadingMascota.set(false);
      },
      error: (error) => {
        console.error('Error al cargar datos de la mascota:', error);
        this.isLoadingMascota.set(false);
      }
    });
  }
  
  onGuardar(): void {
    if (this.atenderForm.valid) {
      const diagnostico = this.atenderForm.get('diagnostico')?.value || '';
      const tratamiento = this.atenderForm.get('tratamiento')?.value || '';
      const mascotaData = this.mascota();
      
      // Preparar información de la mascota para enviar
      let informacionMascota: any = null;
      if (mascotaData && this.cita) {
        // Calcular edad al momento de la consulta (usando la fecha de la cita, no la fecha actual)
        let edad: number | undefined = mascotaData.edad;
        if (!edad && mascotaData.fechaNacimiento && this.cita.fecha) {
          // Usar la fecha de la consulta para calcular la edad
          const fechaConsulta = new Date(this.cita.fecha + 'T00:00:00');
          const nacimiento = new Date(mascotaData.fechaNacimiento + 'T00:00:00');
          
          if (!isNaN(fechaConsulta.getTime()) && !isNaN(nacimiento.getTime())) {
            let edadCalculada = fechaConsulta.getFullYear() - nacimiento.getFullYear();
            const mes = fechaConsulta.getMonth() - nacimiento.getMonth();
            
            if (mes < 0 || (mes === 0 && fechaConsulta.getDate() < nacimiento.getDate())) {
              edadCalculada--;
            }
            
            if (edadCalculada > 0) {
              edad = edadCalculada;
            }
          }
        }
        
        // Preparar fechaNacimiento - solo enviar si tiene un valor válido
        let fechaNacimiento: string | null = null;
        if (mascotaData.fechaNacimiento && mascotaData.fechaNacimiento.trim() !== '') {
          fechaNacimiento = mascotaData.fechaNacimiento;
        }
        
        informacionMascota = {
          nombre: mascotaData.nombre,
          especie: mascotaData.especie,
          raza: mascotaData.raza && mascotaData.raza.trim() !== '' ? mascotaData.raza : null,
          edad: (edad && edad > 0) ? edad : null, // Solo enviar edad si es mayor que 0
          fechaNacimiento: fechaNacimiento, // Solo enviar si tiene valor válido
          sexo: mascotaData.sexo || null
        };
        
        console.log('ModalAtenderCita - informacionMascota a enviar:', informacionMascota);
        console.log('ModalAtenderCita - edad calculada:', edad);
        console.log('ModalAtenderCita - fechaNacimiento:', mascotaData.fechaNacimiento);
      }
      
      this.guardar.emit({ diagnostico, tratamiento, informacionMascota });
    }
  }
  
  onCerrar(): void {
    this.cerrar.emit();
  }
  
  getEdad(): string {
    const mascotaData = this.mascota();
    if (!mascotaData) {
      return 'No especificada';
    }
    
    // Si ya tiene edad calculada, usarla
    if (mascotaData.edad) {
      return `${mascotaData.edad} años`;
    }
    
    // Si no tiene edad pero tiene fecha de nacimiento, calcularla
    if (mascotaData.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(mascotaData.fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      if (edad > 0) {
        return `${edad} años`;
      } else if (edad === 0) {
        // Calcular meses si es menor de un año
        const meses = hoy.getMonth() - nacimiento.getMonth() + (12 * (hoy.getFullYear() - nacimiento.getFullYear()));
        if (meses > 0) {
          return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        } else {
          return 'Menos de un mes';
        }
      } else {
        return 'No especificada';
      }
    }
    
    return 'No especificada';
  }
}

