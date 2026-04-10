import { Component, inject } from '@angular/core';
import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';
import { take } from 'rxjs';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
})
export class App {
  readonly title = 'FPV Lavet';
  private readonly authToken = inject(AuthTokenService);
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.authToken.initializeFromRoute();
    setTimeout(() => {
      const session = this.authToken.getSharedSession();
      if (session?.tokens?.accessToken && !session.user) {
        this.userService
          .getProfile()
          .pipe(take(1))
          .subscribe({
            next: (user) => {
              console.log(
                '[APP] Usuario obtenido desde token, persistiendo sesión completa.',
                user,
              );
              this.authToken.persistToken(session.tokens.accessToken, user);
              // Log extra para verificar storage
              const stored = this.authToken.getSharedSession();
            },
            error: (err) => {
              if (err?.status === 401) {
                console.error('[APP] Token inválido, limpiando sesión.', err);
                this.authToken.clear();
              } else {
                console.error('[APP] Error al obtener usuario, pero se mantiene el token.', err);
              }
              // Log extra para verificar storage tras error
              const stored = this.authToken.getSharedSession();
            },
          });
      } else if (!session?.tokens?.accessToken) {
        console.warn('[APP] No hay token en storage tras initializeFromRoute.');
        // Log extra para verificar storage vacío
        const stored = this.authToken.getSharedSession();
      } else if (session.user) {
        // Log extra para verificar storage completo
        const stored = this.authToken.getSharedSession();
      }
    }, 0);
  }
}
