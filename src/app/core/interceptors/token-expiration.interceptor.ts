import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '@envs/environment';
import { AuthTokenService } from '@core/services/auth-token.service';
import { NotificacioAlertnService } from '@shared/servicios/notificacionAlert';

const SESSION_EXPIRED_MESSAGE = 'La sesión expiró. Por favor inicia sesión nuevamente.';

export const tokenExpirationInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const notificacion = inject(NotificacioAlertnService);
  const handleSessionExpired = () => {
    if (!tokenService.beginExpiredSessionRedirect()) {
      return;
    }

    void notificacion.confirmacion('SESION', SESSION_EXPIRED_MESSAGE).then(() => {
      tokenService.completeExpiredSessionRedirect();
    });
  };

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  if (tokenService.isTokenExpired()) {
    handleSessionExpired();
    return throwError(() => new Error('La sesión expiró.'));
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        handleSessionExpired();
      }

      return throwError(() => error);
    }),
  );
};
