import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthTokenService } from '../services/auth-token.service';

export const authGuard: CanActivateFn = () => {
  const authTokenService = inject(AuthTokenService);

  authTokenService.initializeFromRoute();

  // Verifica que el token exista y no sea vacío

  const token = authTokenService.token();
  // Verifica que el token exista, no sea vacío y tenga formato JWT (tres partes separadas por punto)
  const isValidJwt = !!token && token.trim() !== '' && token.split('.').length === 3;
  if (!isValidJwt) {
    authTokenService.clear(); // Limpia la sesión si el token es inválido
    authTokenService.redirectToPortal();
    return false;
  }

  return true;
};
