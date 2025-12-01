import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SlideComponent } from './components/slide/slide.component';

@Component({
  selector: 'app-public-container',
  standalone: true,
  imports: [
    HeaderComponent,
    SlideComponent
  ],
  templateUrl: './public-container.component.html',
  styleUrl: './public-container.component.css'
})
export class PublicContainerComponent {

}
