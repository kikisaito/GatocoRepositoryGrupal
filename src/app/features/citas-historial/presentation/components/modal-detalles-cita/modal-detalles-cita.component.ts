import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Cita } from '../../../data/models/cita.model';

@Component({
  selector: 'app-modal-detalles-cita',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './modal-detalles-cita.component.html',
  styleUrl: './modal-detalles-cita.component.css'
})
export class ModalDetallesCitaComponent {
  @Input() cita: Cita | null = null;
  
  cerrar = output<void>();
  
  onCerrar(): void {
    this.cerrar.emit();
  }
  
  getEdadMascota(): string {
    if (!this.cita) {
      return 'No especificada';
    }
    
    const info = this.cita.informacionMascota;
    console.log('ModalDetallesCita - cita:', this.cita);
    console.log('ModalDetallesCita - informacionMascota:', info);
    
    // Si hay edad guardada en el snapshot y es mayor que 0, usarla directamente
    if (info?.edad !== null && info?.edad !== undefined && info.edad > 0) {
      return `${info.edad} años`;
    }
    
    // Si hay fecha de nacimiento (ya sea en el snapshot o necesitamos calcularla), calcular la edad al momento de la consulta
    const fechaNacimiento = info?.fechaNacimiento;
    // Verificar que fechaNacimiento no esté vacía
    if (fechaNacimiento && fechaNacimiento.trim() !== '' && this.cita.fecha) {
      // Parsear la fecha de la consulta (formato YYYY-MM-DD)
      const fechaConsulta = new Date(this.cita.fecha + 'T00:00:00');
      const nacimiento = new Date(fechaNacimiento + 'T00:00:00');
      
      // Validar que las fechas sean válidas
      if (isNaN(fechaConsulta.getTime()) || isNaN(nacimiento.getTime())) {
        console.error('ModalDetallesCita - Fechas inválidas:', {
          fechaConsulta: this.cita.fecha,
          fechaNacimiento: fechaNacimiento
        });
        return 'No especificada';
      }
      
      let edad = fechaConsulta.getFullYear() - nacimiento.getFullYear();
      const mes = fechaConsulta.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && fechaConsulta.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      if (edad > 0) {
        return `${edad} años`;
      } else if (edad === 0) {
        // Calcular meses si es menor de un año
        const meses = fechaConsulta.getMonth() - nacimiento.getMonth() + 
                     (12 * (fechaConsulta.getFullYear() - nacimiento.getFullYear()));
        if (meses > 0) {
          return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        } else {
          // Calcular días si es menor de un mes
          const dias = Math.floor((fechaConsulta.getTime() - nacimiento.getTime()) / (1000 * 60 * 60 * 24));
          if (dias > 0) {
            return `${dias} ${dias === 1 ? 'día' : 'días'}`;
          } else {
            return 'Menos de un día';
          }
        }
      }
    }
    
    console.warn('ModalDetallesCita - No se pudo calcular la edad');
    return 'No especificada';
  }
}

