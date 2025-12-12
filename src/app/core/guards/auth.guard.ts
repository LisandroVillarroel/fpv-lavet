import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTokenService } from '../services/auth-token.service';

export const authGuard: CanActivateFn = () => {
  const authTokenService = inject(AuthTokenService);
  const router = inject(Router);

  authTokenService.initializeFromRoute();

  return authTokenService.token() ? true : router.parseUrl('/sin-acceso');
};
