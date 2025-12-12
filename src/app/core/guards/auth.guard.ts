import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthTokenService } from '../services/auth-token.service';

export const authGuard: CanActivateFn = () => {
  const authTokenService = inject(AuthTokenService);

  authTokenService.initializeFromRoute();

  // Si no hay token, redirige al portal de login
  if (!authTokenService.token()) {
    authTokenService.redirectToPortal();
    return false;
  }

  return true;
};
