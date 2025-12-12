import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AuthTokenService } from '../../../core/services/auth-token.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss',
})
export class AccessDeniedComponent {
  constructor(private readonly authTokenService: AuthTokenService) {}

  goToPortal(): void {
    this.authTokenService.redirectToPortal();
  }
}
