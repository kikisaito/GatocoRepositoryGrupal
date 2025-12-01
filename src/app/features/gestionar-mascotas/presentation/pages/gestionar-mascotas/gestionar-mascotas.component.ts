import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthContainerComponent } from '../../../../shared/layout/authcontainer/auth-container.component';
import { PageHeaderComponent } from '../../../../shared/layout/authcontainer/components/page-header/page-header.component';
import { GestionarMascotasViewModel } from '../../viewmodel/gestionar-mascotas.viewmodel';
import { ListaMascotasGestionComponent } from '../../components/lista-mascotas-gestion/lista-mascotas-gestion.component';
import { ModalConfirmacionEliminarComponent } from '../../components/modal-confirmacion-eliminar/modal-confirmacion-eliminar.component';
import { ModalRegistrarMascotaComponent } from '../../components/modal-registrar-mascota/modal-registrar-mascota.component';
import { ModalEditarMascotaComponent } from '../../components/modal-editar-mascota/modal-editar-mascota.component';
import { CreateMascotaRequest } from '../../../data/models/mascota.model';

@Component({
  selector: 'app-gestionar-mascotas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    AuthContainerComponent,
    PageHeaderComponent,
    ListaMascotasGestionComponent,
    ModalConfirmacionEliminarComponent,
    ModalRegistrarMascotaComponent,
    ModalEditarMascotaComponent
  ],
  templateUrl: './gestionar-mascotas.component.html',
  styleUrl: './gestionar-mascotas.component.css'
})
export class GestionarMascotasComponent implements OnInit {
  viewModel = inject(GestionarMascotasViewModel);

  // Exponer signals del ViewModel
  mascotas = this.viewModel.mascotas;
  isLoading = this.viewModel.isLoading;
  error = this.viewModel.error;
  mascotaEditando = this.viewModel.mascotaEditando;
  mostrarModalEditar = this.viewModel.mostrarModalEditar;
  mostrarModalEliminar = this.viewModel.mostrarModalEliminar;
  mascotaAEliminar = this.viewModel.mascotaAEliminar;
  mostrarModalRegistrar = this.viewModel.mostrarModalRegistrar;
  mascotasConCitas = this.viewModel.mascotasConCitas;

  ngOnInit(): void {
    this.viewModel.cargarMascotas();
  }

  onIniciarEdicion(mascota: any): void {
    this.viewModel.iniciarEdicion(mascota);
  }

  onCancelarEdicion(): void {
    this.viewModel.cancelarEdicion();
  }

  async onActualizarMascota(id: number, datos: any): Promise<void> {
    const result = await this.viewModel.actualizarMascota(id, datos);
    
    if (result.success) {
      console.log('Mascota actualizada exitosamente');
    } else {
      console.error('Error al actualizar mascota:', result.message);
    }
  }

  onConfirmarEliminar(mascota: any): void {
    this.viewModel.confirmarEliminar(mascota);
  }

  onCancelarEliminacion(): void {
    this.viewModel.cancelarEliminacion();
  }

  async onEliminarMascota(id: number): Promise<void> {
    const result = await this.viewModel.eliminarMascota(id);
    
    if (result.success) {
      console.log('Mascota eliminada exitosamente');
    } else {
      // El error ya está establecido en el viewModel, pero podemos mostrar un alert o notificación
      console.error('Error al eliminar mascota:', result.message);
      // El error se mostrará automáticamente en el template a través del signal error()
    }
  }

  onAbrirModalRegistrar(): void {
    this.viewModel.abrirModalRegistrar();
  }

  async onRegistrarMascota(datos: CreateMascotaRequest): Promise<void> {
    const result = await this.viewModel.registrarMascota(datos);
    
    if (result.success) {
      console.log('Mascota registrada exitosamente');
    }
  }

  onCerrarModalRegistrar(): void {
    this.viewModel.cerrarModalRegistrar();
  }

  async onSubirFoto(id: number, file: File): Promise<void> {
    const result = await this.viewModel.subirFoto(id, file);
    if (result.success) {
      console.log('Foto subida exitosamente');
    } else {
      console.error('Error al subir foto:', result.message);
    }
  }

  async onEliminarFoto(id: number): Promise<void> {
    const result = await this.viewModel.eliminarFoto(id);
    if (result.success) {
      console.log('Foto eliminada exitosamente');
    } else {
      console.error('Error al eliminar foto:', result.message);
    }
  }
}

