import { HttpInterceptorFn, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { Progreso } from '@core/guards/progreso';
import { delayWhen, finalize, of, timer, tap } from 'rxjs';

export const cargaProgresoInterceptor: HttpInterceptorFn = (req, next) => {
  const progresoCarga = inject(Progreso);
  const minDelayMs = 500;
  const resetDelayMs = 1000;
  const startTime = Date.now();
  const source = req.headers?.get?.('X-Progress-Source');
  const isUploadFormData = req.method === 'POST' && req.body instanceof FormData;
  const shouldShowGlobal = source !== 'dialog';
  const simulationTimeouts: Array<ReturnType<typeof setTimeout>> = [];

  if (!shouldShowGlobal) {
    return next(req);
  }

  progresoCarga.iniciarCargaGlobal();

  if (shouldShowGlobal && !isUploadFormData) {
    progresoCarga.animateTo(30, 200);
    simulationTimeouts.push(setTimeout(() => {
      if (progresoCarga.isCargando()) {
        progresoCarga.animateTo(60, 300);
      }
    }, 200));
    simulationTimeouts.push(setTimeout(() => {
      if (progresoCarga.isCargando()) {
        progresoCarga.animateTo(80, 400);
      }
    }, 500));
  }

  return next(req).pipe(
    tap((event) => {
      if (event && (event as any).type === HttpEventType.UploadProgress) {
        const e = event as any;
        if (e.total) {
          const percent = Math.round((100 * e.loaded) / e.total);
          progresoCarga.animateTo(percent);
        }
      }

      if (event && (event as any).type === HttpEventType.Response) {
        if (progresoCarga.cargasActivas() <= 1) {
          progresoCarga.animateTo(100);
        } else {
          progresoCarga.animateTo(Math.max(progresoCarga.porcentaje(), 85), 150);
        }
      }
    }),
    delayWhen(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minDelayMs - elapsedTime;
      return remainingTime > 0 ? timer(remainingTime) : of(null);
    }),
    finalize(() => {
      simulationTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      progresoCarga.finalizarCargaGlobal(resetDelayMs);
    }),
  );
};
