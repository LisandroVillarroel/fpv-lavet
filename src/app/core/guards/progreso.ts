import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Progreso {
  private readonly _cargasActivas = signal(0);
  readonly isCargando = computed(() => this._cargasActivas() > 0);
  readonly cargasActivas = this._cargasActivas.asReadonly();
  /** Porcentaje de progreso (0-100). */
  readonly porcentaje = signal<number>(0);
  private _resetTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public iniciarCargaGlobal() {
    this.cancelarResetPendiente();
    const cargasActivas = this._cargasActivas();
    this._cargasActivas.set(cargasActivas + 1);

    if (cargasActivas === 0) {
      this.cancelarAnimacion();
      this.porcentaje.set(0);
    }
  }

  public finalizarCargaGlobal(resetDelayMs = 0) {
    const cargasRestantes = Math.max(0, this._cargasActivas() - 1);
    this._cargasActivas.set(cargasRestantes);

    if (cargasRestantes > 0) {
      return;
    }

    this.cancelarAnimacion();
    this.porcentaje.set(100);
    this.programarReset(resetDelayMs);
  }

  public resetear() {
    this.cancelarAnimacion();
    this.cancelarResetPendiente();
    this._cargasActivas.set(0);
    this.porcentaje.set(0);
  }

  public setPorcentaje(value: number) {
    this.porcentaje.set(value > 100 ? 100 : value < 0 ? 0 : value);
  }

  /**
   * Animación suave del porcentaje desde el valor actual hasta target (count-up).
   * Cancela cualquier animación previa.
   */
  private _rafId: number | null = null;
  public animateTo(target: number, duration = 400) {
    this.cancelarResetPendiente();
    this.cancelarAnimacion();

    const start = performance.now();
    const from = this.porcentaje();
    const to = Math.max(0, Math.min(100, Math.round(target)));

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad
      const eased = t * (2 - t);
      const value = Math.round(from + (to - from) * eased);
      this.porcentaje.set(value);
      if (t < 1) {
        this._rafId = requestAnimationFrame(step);
      } else {
        this._rafId = null;
      }
    };

    this._rafId = requestAnimationFrame(step);
  }

  private programarReset(delayMs: number) {
    this.cancelarResetPendiente();

    if (delayMs <= 0) {
      this.porcentaje.set(0);
      return;
    }

    this._resetTimeoutId = setTimeout(() => {
      this._resetTimeoutId = null;
      this.porcentaje.set(0);
    }, delayMs);
  }

  private cancelarResetPendiente() {
    if (this._resetTimeoutId) {
      clearTimeout(this._resetTimeoutId);
      this._resetTimeoutId = null;
    }
  }

  private cancelarAnimacion() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
