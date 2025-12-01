import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';
import { DashboardViewModel } from '../../viewmodel/dashboard.viewmodel';

@Component({
  selector: 'app-mascotas-registradas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mascotas-registradas.component.html',
  styleUrl: './mascotas-registradas.component.css'
})
export class MascotasRegistradasComponent implements OnInit {
  private viewModel = inject(DashboardViewModel);

  // Exponer signals del ViewModel
  mascotas = computed(() => this.viewModel.mascotas());
  isLoading = computed(() => this.viewModel.isLoading());
  error = computed(() => this.viewModel.error());

  ngOnInit(): void {
    // Cargar mascotas al inicializar el componente
    this.viewModel.cargarMascotas();
  }

  getTipoIcon(especie: string): string {
    return this.viewModel.getTipoIcon(especie);
  }

}
