import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-buttons',
  standalone: true,
  templateUrl: './home-buttons.component.html',
  styleUrl: './home-buttons.component.css'
})
export class HomeButtonsComponent {
  @Output() loginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<void>();

  onLoginClick() {
    this.loginClick.emit();
  }

  onRegisterClick() {
    this.registerClick.emit();
  }
}
