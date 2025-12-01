import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PublicContainerComponent } from '../../../../shared/layout/publiccontainer/public-container.component';
import { HomeTextComponent } from '../../components/home-text/home-text.component';
import { HomeButtonsComponent } from '../../components/home-buttons/home-buttons.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PublicContainerComponent, HomeTextComponent, HomeButtonsComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  
  constructor(private router: Router) {}

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  onRegisterClick() {
    this.router.navigate(['/register']);
  }
}
