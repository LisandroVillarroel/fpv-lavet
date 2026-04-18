import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '@envs/environment';
import { AuthTokenService } from '@core/services/auth-token.service';

export const tokenExpirationInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  if (tokenService.isTokenExpired()) {
    tokenService.handleExpiredSession();
    return throwError(() => new Error('La sesión expiró.'));
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        tokenService.handleExpiredSession();
      }

      return throwError(() => error);
    }),
  );
};
