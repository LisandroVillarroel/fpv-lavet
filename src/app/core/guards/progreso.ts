import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Progreso {
  isCargando = signal<boolean>(false);
  /** Porcentaje de progreso (0-100). */
  porcentaje = signal<number>(0);
  public ejecutar() {
    this.isCargando.set(true);
  }

  public parar() {
    this.isCargando.set(false);
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
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

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
}
