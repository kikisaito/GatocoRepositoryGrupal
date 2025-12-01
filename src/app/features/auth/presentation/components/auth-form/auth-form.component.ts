import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormField {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
    value?: string;
    options?: { value: string; label: string }[]; // Para campos select
}

@Component({
    selector: 'app-auth-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './auth-form.component.html',
    styleUrl: './auth-form.component.css'
})
export class AuthFormComponent {
    @Input() formType: 'login' | 'register' = 'login';
    @Input() fields: FormField[] = [];
    @Input() isLoading: boolean = false;
    @Input() error: string = '';
    @Output() formSubmit = new EventEmitter<any>();

    formValues: { [key: string]: string } = {};

    ngOnChanges(): void {
        if (this.fields.length > 0) {
            this.formValues = {}; // Resetear valores
            this.fields.forEach(field => {
                // Inicializar cada campo con string vacío o el valor proporcionado
                this.formValues[field.name] = field.value || '';
            });
        }
    }

    onInputChange(name: string, value: string): void {
        this.formValues[name] = value;
    }

    onSubmit(): void {
        this.formSubmit.emit(this.formValues);
    }

    get isLoginForm(): boolean {
        return this.formType === 'login';
    }
}
