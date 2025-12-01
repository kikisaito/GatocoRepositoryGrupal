import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../../gestionar-mascotas/data/models/mascota.model';

@Component({
  selector: 'app-ficha-mascota',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha-mascota.component.html',
  styleUrl: './ficha-mascota.component.css'
})
export class FichaMascotaComponent {
  @Input() mascota: Mascota | null = null;

  getTipoIcon(especie: string): string {
    const especieLower = especie.toLowerCase();
    if (especieLower.includes('perro')) return '🐕';
    if (especieLower.includes('gato')) return '🐱';
    if (especieLower.includes('conejo')) return '🐰';
    if (especieLower.includes('ave') || especieLower.includes('pájaro')) return '🐦';
    return '🐾';
  }
}

