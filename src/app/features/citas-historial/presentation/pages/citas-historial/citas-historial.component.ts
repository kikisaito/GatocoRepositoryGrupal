import { Component, ViewChild, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthContainerComponent } from '../../../../shared/layout/authcontainer/auth-container.component';
import { PageHeaderComponent } from '../../../../shared/layout/authcontainer/components/page-header/page-header.component';
import { TableCitasComponent } from '../../components/table-citas/table-citas.component';
import { FiltroMascotasComponent } from '../../components/filtro-mascotas/filtro-mascotas.component';
import { FiltroEstadosComponent } from '../../components/filtro-estados/filtro-estados.component';
import { AuthContext } from '../../../../../core/utils/authcontext';

@Component({
  selector: 'app-citas-historial',
  standalone: true,
  imports: [
    CommonModule,
    AuthContainerComponent,
    PageHeaderComponent,
    TableCitasComponent,
    FiltroMascotasComponent,
    FiltroEstadosComponent
  ],
  templateUrl: './citas-historial.component.html',
  styleUrl: './citas-historial.component.css'
})
export class CitasHistorialComponent implements OnInit {
  private authContext = inject(AuthContext);
  
  @ViewChild(TableCitasComponent) tableCitasComponent!: TableCitasComponent;

  isVeterinario = signal<boolean>(false);

  ngOnInit(): void {
    const currentUser = this.authContext.getCurrentUser();
    this.isVeterinario.set(currentUser?.role === 'veterinario');
    
    // Suscribirse a cambios del usuario
    this.authContext.currentUser$.subscribe(user => {
      this.isVeterinario.set(user?.role === 'veterinario');
    });
  }

  onMascotaSeleccionada(mascota: string | null): void {
    this.tableCitasComponent.onMascotaSeleccionada(mascota);
  }

  onEstadoSeleccionado(estado: string | null): void {
    this.tableCitasComponent.onEstadoSeleccionado(estado);
  }
}

