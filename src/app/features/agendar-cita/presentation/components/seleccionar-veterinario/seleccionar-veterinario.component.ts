import { Component, output, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { VeterinariosApiService, Veterinario } from '../../../../../core/services/veterinarios-api.service';

@Component({
  selector: 'app-seleccionar-veterinario',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './seleccionar-veterinario.component.html',
  styleUrl: './seleccionar-veterinario.component.css'
})
export class SeleccionarVeterinarioComponent implements OnInit {
  private veterinariosApiService = inject(VeterinariosApiService);
  private cdr = inject(ChangeDetectorRef);

  veterinarioSeleccionadoChange = output<number>();

  veterinarioSeleccionado: number | null = null;
  veterinarios: Veterinario[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.cargarVeterinarios();
  }

  cargarVeterinarios(): void {
    this.isLoading = true;
    
    console.log('SeleccionarVeterinarioComponent - Cargando veterinarios...');
    
    this.veterinariosApiService.getVeterinarios().subscribe({
      next: (response) => {
        console.log('SeleccionarVeterinarioComponent - Respuesta:', response);
        if (response.success && response.data) {
          this.veterinarios = response.data;
          console.log('SeleccionarVeterinarioComponent - Veterinarios cargados:', this.veterinarios);
        } else {
          console.warn('SeleccionarVeterinarioComponent - Sin datos de veterinarios en la respuesta');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('SeleccionarVeterinarioComponent - Error al cargar veterinarios:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onVeterinarioChange(veterinarioId: number): void {
    console.log('Veterinario seleccionado en componente:', veterinarioId);
    this.veterinarioSeleccionado = veterinarioId;
    this.veterinarioSeleccionadoChange.emit(this.veterinarioSeleccionado);
  }
}


