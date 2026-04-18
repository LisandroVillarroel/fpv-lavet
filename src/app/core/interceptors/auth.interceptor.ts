import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '@envs/environment';
import { AuthTokenService } from '@core/services/auth-token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const authorization = tokenService.getAuthorizationHeader();

  if (authorization) {
    req = req.clone({ setHeaders: { Authorization: authorization } });
  }

  return next(req);
};
