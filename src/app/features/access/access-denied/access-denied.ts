import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AuthTokenService } from '@core/services/auth-token.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {
  constructor(private readonly authTokenService: AuthTokenService) {}

  goToPortal(): void {
    this.authTokenService.redirectToPortal();
  }
}
