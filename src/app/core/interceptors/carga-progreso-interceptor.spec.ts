import { TestBed } from '@angular/core/testing';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpEventType,
  HttpUploadProgressEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, Subject, from } from 'rxjs';
import { afterEach, beforeEach, vi } from 'vitest';

import { Progreso } from '@core/guards/progreso';
import { cargaProgresoInterceptor } from './carga-progreso-interceptor';

describe('cargaProgresoInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => cargaProgresoInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should update progreso porcentaje on upload events', async () => {
    const req = new HttpRequest('POST', '/upload', new FormData());

    const uploadEvent: HttpUploadProgressEvent = {
      type: HttpEventType.UploadProgress,
      loaded: 50,
      total: 100,
    };
    const responseEvent = new HttpResponse({
      body: { codigo: 200 },
      status: 200,
    });

    const next = (r: any) => from([uploadEvent, responseEvent]) as any;

    await TestBed.runInInjectionContext(async () => {
      const progreso = TestBed.inject(Progreso);
      vi.spyOn(progreso, 'animateTo').mockImplementation((target: number) => {
        progreso.setPorcentaje(target);
      });

      const completion = new Promise<void>((resolve) => {
        cargaProgresoInterceptor(req, next).subscribe({
          complete: resolve,
        });
      });

      await vi.advanceTimersByTimeAsync(500);
      await completion;

      expect(progreso.porcentaje()).toBe(100);
    });
  });

  it('should keep global progress active until all concurrent requests complete', async () => {
    const firstReq = new HttpRequest('GET', '/first');
    const secondReq = new HttpRequest('GET', '/second');
    const firstSubject = new Subject<HttpEvent<unknown>>();
    const secondSubject = new Subject<HttpEvent<unknown>>();
    const next = (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> =>
      request.url === '/first' ? firstSubject.asObservable() : secondSubject.asObservable();

    await TestBed.runInInjectionContext(async () => {
      const progreso = TestBed.inject(Progreso);
      vi.spyOn(progreso, 'animateTo').mockImplementation((target: number) => {
        progreso.setPorcentaje(target);
      });

      cargaProgresoInterceptor(firstReq, next).subscribe();
      cargaProgresoInterceptor(secondReq, next).subscribe();

      expect(progreso.isCargando()).toBeTruthy();
      expect(progreso.cargasActivas()).toBe(2);

      firstSubject.next(new HttpResponse({ status: 200, body: { ok: true } }));
      firstSubject.complete();
      await vi.advanceTimersByTimeAsync(500);

      expect(progreso.isCargando()).toBeTruthy();
      expect(progreso.cargasActivas()).toBe(1);

      secondSubject.next(new HttpResponse({ status: 200, body: { ok: true } }));
      secondSubject.complete();
      await vi.advanceTimersByTimeAsync(500);

      expect(progreso.isCargando()).toBeFalsy();
      expect(progreso.porcentaje()).toBe(100);

      await vi.advanceTimersByTimeAsync(1000);

      expect(progreso.porcentaje()).toBe(0);
    });
  });

  it('should ignore dialog requests without affecting global progress', async () => {
    const globalReq = new HttpRequest('GET', '/global');
    const dialogReq = new HttpRequest('GET', '/dialog', {
      headers: undefined,
    }).clone({
      setHeaders: { 'X-Progress-Source': 'dialog' },
    });
    const globalSubject = new Subject<HttpEvent<unknown>>();
    const dialogSubject = new Subject<HttpEvent<unknown>>();
    const next = (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> =>
      request.url === '/global' ? globalSubject.asObservable() : dialogSubject.asObservable();

    await TestBed.runInInjectionContext(async () => {
      const progreso = TestBed.inject(Progreso);
      vi.spyOn(progreso, 'animateTo').mockImplementation((target: number) => {
        progreso.setPorcentaje(target);
      });

      cargaProgresoInterceptor(globalReq, next).subscribe();
      expect(progreso.isCargando()).toBeTruthy();
      expect(progreso.cargasActivas()).toBe(1);

      cargaProgresoInterceptor(dialogReq, next).subscribe();
      dialogSubject.next(new HttpResponse({ status: 200, body: { ok: true } }));
      dialogSubject.complete();
      await vi.advanceTimersByTimeAsync(500);

      expect(progreso.isCargando()).toBeTruthy();
      expect(progreso.cargasActivas()).toBe(1);

      globalSubject.next(new HttpResponse({ status: 200, body: { ok: true } }));
      globalSubject.complete();
      await vi.advanceTimersByTimeAsync(500);
      await vi.advanceTimersByTimeAsync(1000);

      expect(progreso.isCargando()).toBeFalsy();
      expect(progreso.porcentaje()).toBe(0);
    });
  });
});
