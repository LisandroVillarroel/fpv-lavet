import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTokenService } from '../services/auth-token.service';

export const authGuard: CanActivateFn = () => {
  const authTokenService = inject(AuthTokenService);
  const router = inject(Router);

  authTokenService.initializeFromRoute();

  // Si no hay token, redirige al login
  return authTokenService.token() ? true : router.parseUrl('/auth/login');
};
