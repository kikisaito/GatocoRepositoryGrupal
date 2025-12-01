import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-slide',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './slide.component.html',
    styleUrl: './slide.component.css'
})
export class SlideComponent implements OnInit, OnDestroy {
    currentImage: string = '';
    imageAlt: string = '';
    private subscription?: Subscription;

    constructor(private router: Router) { }

    ngOnInit(): void {
        // Obtener imagen según la ruta actual
        this.updateImage();

        // Suscribirse a cambios de ruta
        this.subscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.updateImage();
            });
    }

    ngOnDestroy(): void {
        // Limpiar suscripción para evitar memory leaks
        this.subscription?.unsubscribe();
    }

    private updateImage(): void {
        const url = this.router.url;

        if (url.includes('/home') || url === '/' || url === '') {
            // Home
            this.currentImage = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop&crop=center';
            this.imageAlt = 'Gato adorable';
        } else if (url.includes('/register')) {
            // Register
            this.currentImage = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&crop=center';
            this.imageAlt = 'Gato y perro juntos';
        } else if (url.includes('/login')) {
            // Login
            this.currentImage = 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop&crop=center';
            this.imageAlt = 'Gato hermoso';
        } else {
            // Default
            this.currentImage = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop&crop=center';
            this.imageAlt = 'Gato adorable';
        }
    }
}
