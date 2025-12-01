import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel } from '../../viewmodel/dashboard.viewmodel';
import { Cita } from '../../../../citas-historial/data/models/cita.model';

@Component({
  selector: 'app-proximas-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proximas-citas.component.html',
  styleUrl: './proximas-citas.component.css'
})
export class ProximasCitasComponent implements OnInit {
  private dashboardViewModel = inject(DashboardViewModel);
  
  // Exponer signals del ViewModel
  proximasCitas = this.dashboardViewModel.proximasCitas;

  ngOnInit(): void {
    // Cargar citas al inicializar
    this.dashboardViewModel.cargarCitas();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'estado-confirmada';
      case 'pendiente':
        return 'estado-pendiente';
      case 'completada':
        return 'estado-completada';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return '';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  }
}
