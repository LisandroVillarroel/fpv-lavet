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
    console.log('[APP] ngOnInit: inicializando sesión...');
    this.authToken.initializeFromRoute();
    setTimeout(() => {
      const session = this.authToken.getSharedSession();
      console.log('[APP] Sesión tras initializeFromRoute:', session);
      if (session?.tokens?.accessToken && !session.user) {
        console.log('[APP] Hay token pero falta user. Solicitando usuario al backend...');
        console.log('[APP][DEBUG] Token detectado:', session.tokens.accessToken);
        this.userService
          .getProfile()
          .pipe(take(1))
          .subscribe({
            next: (user) => {
              console.log('[APP] Usuario recibido del backend:', user);
              this.authToken.persistToken(session.tokens.accessToken, user);
              console.log('[APP] Sesión actualizada en storage.');
              // Log extra para verificar storage
              const stored = this.authToken.getSharedSession();
              console.log('[APP][DEBUG] Sesión guardada tras persistToken:', stored);
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
              console.log('[APP][DEBUG] Sesión en storage tras error:', stored);
            },
          });
      } else if (!session?.tokens?.accessToken) {
        console.warn('[APP] No hay token en storage tras initializeFromRoute.');
        // Log extra para verificar storage vacío
        const stored = this.authToken.getSharedSession();
        console.log('[APP][DEBUG] Storage vacío:', stored);
      } else if (session.user) {
        console.log('[APP] Sesión ya completa (token y user presentes).');
        // Log extra para verificar storage completo
        const stored = this.authToken.getSharedSession();
        console.log('[APP][DEBUG] Storage completo:', stored);
      }
    }, 0);
  }
}
