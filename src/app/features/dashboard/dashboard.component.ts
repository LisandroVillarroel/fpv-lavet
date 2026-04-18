import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export default class DashboardComponent implements OnInit {
  private readonly _authToken = inject(AuthTokenService);
  private readonly _userService = inject(UserService);

  now = Date.now();

  ngOnInit(): void {
    this._authToken.initializeFromRoute();
    // Si hay token pero no user, obtener el usuario y persistirlo
    const session = this._authToken.getStorage();
    if (session?.tokens?.accessToken && !session.user) {
      this._userService
        .getProfile()
        .pipe(take(1))
        .subscribe({
          next: (user) => {
            this._authToken.persistToken(session.tokens.accessToken, user);
          },
          error: () => {
            // Si falla, limpiar sesión por seguridad
            this._authToken.clear();
          },
        });
    }
  }

  logout(): void {
    this._authToken.clear();
    this._authToken.redirectToPortal();
  }
}
