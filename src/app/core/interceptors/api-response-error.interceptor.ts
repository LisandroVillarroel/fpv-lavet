import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { mergeMap, of, throwError } from 'rxjs';

import { environment } from '@envs/environment';
import { NotificacioAlertnService } from '@shared/servicios/notificacionAlert';

type ApiResponseBody = {
  error?: boolean;
  codigo?: number;
  mensaje?: string;
};

const DEFAULT_API_ERROR_MESSAGE = 'Ocurrió un problema Inesperado.';

export const apiResponseErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificacion = inject(NotificacioAlertnService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  return next(req).pipe(
    mergeMap((event) => {
      if (!(event instanceof HttpResponse)) {
        return of(event);
      }

      const body = event.body as ApiResponseBody | null;
      if (!body || typeof body !== 'object' || typeof body.codigo !== 'number') {
        return of(event);
      }

      if (body.codigo === 200) {
        return of(event);
      }

      const mensaje = body.mensaje?.trim() || DEFAULT_API_ERROR_MESSAGE;
      notificacion.error('ERROR', mensaje);

      return throwError(
        () =>
          new HttpErrorResponse({
            status: event.status,
            statusText: event.statusText,
            url: event.url ?? undefined,
            headers: event.headers,
            error: {
              ...body,
              mensaje,
            },
          }),
      );
    }),
  );
};
