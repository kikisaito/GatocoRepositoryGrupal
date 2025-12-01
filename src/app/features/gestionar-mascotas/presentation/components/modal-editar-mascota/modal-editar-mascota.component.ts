import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Mascota, UpdateMascotaRequest } from '../../../data/models/mascota.model';

@Component({
  selector: 'app-modal-editar-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './modal-editar-mascota.component.html',
  styleUrl: './modal-editar-mascota.component.css'
})
export class ModalEditarMascotaComponent implements OnInit {
  @Input() mascota: Mascota | null = null;
  @Input() error: string | null = null;
  @Output() confirmar = new EventEmitter<{ id: number; datos: UpdateMascotaRequest }>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() subirFoto = new EventEmitter<{ id: number; file: File }>();
  @Output() eliminarFoto = new EventEmitter<number>();
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  mascotaData: any = {
    nombre: '',
    especie: '',
    raza: '',
    fechaNacimiento: '',
    sexo: ''
  };

  opcionesSexo = [
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' }
  ];

  ngOnInit(): void {
    if (this.mascota) {
      this.mascotaData = {
        nombre: this.mascota.nombre,
        especie: this.mascota.especie,
        raza: this.mascota.raza,
        fechaNacimiento: this.mascota.fechaNacimiento,
        sexo: this.mascota.sexo
      };
      this.previewUrl = this.mascota.foto || null;
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  onSubirFoto(): void {
    if (this.mascota && this.selectedFile) {
      this.subirFoto.emit({ id: this.mascota.id, file: this.selectedFile });
      this.selectedFile = null;
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }
  
  onEliminarFoto(): void {
    if (this.mascota) {
      if (confirm('¿Estás seguro de que deseas eliminar la foto de esta mascota?')) {
        this.eliminarFoto.emit(this.mascota.id);
        this.previewUrl = null;
        this.selectedFile = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      }
    }
  }
  
  getFotoActual(): string | null {
    return this.mascota?.foto || null;
  }

  onConfirmar(): void {
    if (this.mascota && this.esFormValid()) {
      const requestData: UpdateMascotaRequest = {
        nombre: this.mascotaData.nombre,
        especie: this.mascotaData.especie,
        raza: this.mascotaData.raza,
        fechaNacimiento: this.mascotaData.fechaNacimiento,
        sexo: this.mascotaData.sexo as 'macho' | 'hembra'
      };
      this.confirmar.emit({ id: this.mascota.id, datos: requestData });
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
    return !!(
      this.mascotaData.nombre?.trim() &&
      this.mascotaData.especie?.trim() &&
      this.mascotaData.raza?.trim() &&
      this.mascotaData.fechaNacimiento &&
      this.mascotaData.sexo &&
      this.mascotaData.sexo !== ''
    );
  }
}

