import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateMascotaRequest } from '../../../data/models/mascota.model';

@Component({
  selector: 'app-modal-registrar-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-registrar-mascota.component.html',
  styleUrl: './modal-registrar-mascota.component.css'
})
export class ModalRegistrarMascotaComponent {
  @Output() confirmar = new EventEmitter<CreateMascotaRequest>();
  @Output() cancelar = new EventEmitter<void>();

  mascotaData: any = {
    nombre: '',
    especie: '',
    raza: '',
    fechaNacimiento: '',
    sexo: ''
  };

  opcionesSexo = [
    { value: '', label: 'Seleccionar sexo' },
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' }
  ];

  onConfirmar(): void {
    if (this.esFormValid()) {
      console.log('ModalRegistrarMascota - Datos a enviar:', this.mascotaData);
      // Convertir a tipo CreateMascotaRequest válido
      const requestData: CreateMascotaRequest = {
        nombre: this.mascotaData.nombre,
        especie: this.mascotaData.especie,
        raza: this.mascotaData.raza,
        fechaNacimiento: this.mascotaData.fechaNacimiento,
        sexo: this.mascotaData.sexo as 'macho' | 'hembra'
      };
      this.confirmar.emit(requestData);
    } else {
      console.log('Formulario no válido:', this.mascotaData);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  getToday(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }

  esFormValid(): boolean {
    const isValid = !!(
      this.mascotaData.nombre?.trim() &&
      this.mascotaData.especie?.trim() &&
      this.mascotaData.raza?.trim() &&
      this.mascotaData.fechaNacimiento &&
      this.mascotaData.sexo &&
      this.mascotaData.sexo !== ''
    );
    console.log('Validación formulario:', {
      nombre: this.mascotaData.nombre,
      especie: this.mascotaData.especie,
      raza: this.mascotaData.raza,
      fecha: this.mascotaData.fechaNacimiento,
      sexo: this.mascotaData.sexo,
      isValid
    });
    return isValid;
  }
}

