import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-seleccionar-fecha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './seleccionar-fecha.component.html',
  styleUrl: './seleccionar-fecha.component.css'
})
export class SeleccionarFechaComponent {
  fechaSeleccionadaChange = output<string>();
  horaSeleccionadaChange = output<string>();

  fechaSeleccionada: Date | null = null;
  fechaSeleccionadaString: string = '';
  horaSeleccionada: string = '';
  
  // Obtener la fecha mínima (mañana)
  fechaMinima: Date = this.obtenerFechaMinima();
  
  // Horas disponibles en formato de 24 horas (para el backend)
  horasDisponibles24h: string[] = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30',
    '22:00'
  ];

  // Horas disponibles en formato de 12 horas (para mostrar)
  horasDisponibles: { value: string; display: string }[] = this.generarHoras12h();

  generarHoras12h(): { value: string; display: string }[] {
    return this.horasDisponibles24h.map(hora24 => {
      const [horas, minutos] = hora24.split(':');
      const hora = parseInt(horas, 10);
      const periodo = hora >= 12 ? 'PM' : 'AM';
      let hora12 = hora % 12;
      if (hora12 === 0) hora12 = 12;
      return {
        value: hora24, // Mantener formato 24h para el backend
        display: `${hora12}:${minutos} ${periodo}` // Mostrar formato 12h
      };
    });
  }

  obtenerFechaMinima(): Date {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(0, 0, 0, 0);
    return mañana;
  }

  onFechaChange(value: Date | null): void {
    this.fechaSeleccionada = value;
    if (value) {
      // Convertir Date a string formato YYYY-MM-DD
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      this.fechaSeleccionadaString = `${year}-${month}-${day}`;
      this.fechaSeleccionadaChange.emit(this.fechaSeleccionadaString);
    } else {
      this.fechaSeleccionadaString = '';
      this.fechaSeleccionadaChange.emit('');
    }
  }

  onHoraChange(value: string): void {
    this.horaSeleccionada = value;
    this.horaSeleccionadaChange.emit(this.horaSeleccionada);
  }

  getFechaFormateada(fecha: Date | null): string {
    if (!fecha) return '';
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Filtro para permitir solo días laborables (lunes a viernes)
  // Retorna true si el día es lunes (1) a viernes (5), false para sábado (6) y domingo (0)
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDay();
    // 0 = domingo, 1 = lunes, ..., 5 = viernes, 6 = sábado
    // Permitir solo lunes (1) a viernes (5)
    return day >= 1 && day <= 5;
  };
}

