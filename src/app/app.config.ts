import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from '@app/app.routes';
import { apiResponseErrorInterceptor } from '@core/interceptors/api-response-error.interceptor';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { tokenExpirationInterceptor } from '@core/interceptors/token-expiration.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { cargaProgresoInterceptor } from '@core/interceptors/carga-progreso-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        apiResponseErrorInterceptor,
        tokenExpirationInterceptor,
        authInterceptor,
        cargaProgresoInterceptor,
      ]),
    ),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        floatLabel: 'never',
        SubscripSizing: 'dynamic',
      },
    },
    { provide: LOCALE_ID, useValue: 'es-CL' },
  ],
};
