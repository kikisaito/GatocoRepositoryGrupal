import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthContainerComponent } from '../../../../shared/layout/authcontainer/auth-container.component';
import { PageHeaderComponent } from '../../../../shared/layout/authcontainer/components/page-header/page-header.component';
import { AlertaPersonalizadaComponent, TipoAlerta } from '../../../../agendar-cita/presentation/components/alerta-personalizada/alerta-personalizada.component';
import { AuthContext } from '../../../../../core/utils/authcontext';
import { EstadisticasResumenComponent } from '../../components/estadisticas-resumen/estadisticas-resumen.component';
import { CitasPendientesComponent } from '../../components/citas-pendientes/citas-pendientes.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AuthContainerComponent,
    PageHeaderComponent,
    AlertaPersonalizadaComponent,
    EstadisticasResumenComponent,
    CitasPendientesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authContext = inject(AuthContext);

  // Estado de alerta personalizada
  mostrarAlerta = signal<boolean>(false);
  mensajeAlerta = signal<string>('');
  tipoAlerta = signal<TipoAlerta>('info');
  
  // Estado del usuario
  currentUser = signal(this.authContext.getCurrentUser());
  isVeterinario = signal(this.currentUser()?.role === 'veterinario');

  @ViewChild(EstadisticasResumenComponent) estadisticasComponent!: EstadisticasResumenComponent;

  ngOnInit(): void {
    // Verificar si hay un query parameter de cita confirmada
    this.route.queryParams.subscribe(params => {
      if (params['citaConfirmada'] === 'true') {
        this.mostrarAlertaPersonalizada('¡Cita confirmada exitosamente!', 'success');
        // Limpiar el query parameter de la URL
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    });
    
    // Actualizar el estado del usuario
    this.authContext.currentUser$.subscribe(user => {
      this.currentUser.set(user);
      this.isVeterinario.set(user?.role === 'veterinario');
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

  onCitasActualizadas(): void {
    // Recargar las estadísticas cuando se actualizan las citas
    if (this.estadisticasComponent) {
      this.estadisticasComponent.recargarCitas();
    }
  }
}
