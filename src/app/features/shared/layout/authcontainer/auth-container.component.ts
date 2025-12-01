import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthContext, UserInContext } from '../../../../core/utils/authcontext';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [SidebarComponent, AsyncPipe],
  templateUrl: './auth-container.component.html',
  styleUrl: './auth-container.component.css'
})
export class AuthContainerComponent implements OnInit {
  currentUser$: Observable<UserInContext | null>;
  mobileMenuOpen: boolean = false;
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  constructor(private authContext: AuthContext) {
    this.currentUser$ = this.authContext.currentUser$;
  }

  ngOnInit(): void {}

  onMobileMenuToggle(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.sidebar) {
      this.sidebar.mobileMenuOpen = this.mobileMenuOpen;
    }
  }
}
