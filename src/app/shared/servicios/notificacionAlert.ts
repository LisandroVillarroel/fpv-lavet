import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/**
 * Notificacion sevicio usando Signal
 * Gestiona las notificaciones de brindis de forma reactiva
 */
@Injectable({
  providedIn: 'root',
})
export class NotificacioAlertnService {
  private readonly document = inject(DOCUMENT);

  private getAlertTarget(): HTMLElement {
    return (this.document.querySelector('.cdk-overlay-container') ??
      this.document.body) as HTMLElement;
  }

  private getActiveDialogPane(): HTMLElement | null {
    const panes = Array.from(this.document.querySelectorAll('.cdk-overlay-pane')) as HTMLElement[];

    for (let index = panes.length - 1; index >= 0; index -= 1) {
      const pane = panes[index];
      if (pane?.querySelector('.mat-mdc-dialog-container')) {
        return pane;
      }
    }

    return null;
  }

  // Utilidad para obtener variables CSS del tema activo
  private getThemeColors() {
    const style = getComputedStyle(this.document.body);
    return {
      background: style.getPropertyValue('--mat-sys-surface').trim() || '#fff',
      color: style.getPropertyValue('--mat-sys-on-surface').trim() || '#222',
      confirmButtonColor: style.getPropertyValue('--mat-sys-primary').trim() || '#1976d2',
      cancelButtonColor: style.getPropertyValue('--mat-sys-secondary').trim() || '#888',
    };
  }

  private notificationMixin = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    target: this.getAlertTarget(),
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  private notificationMixinSeleccion = Swal.mixin({
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    showCancelButton: true,
    showCloseButton: true,
    target: this.getAlertTarget(),
    customClass: {
      popup: 'my-custom-popup',
      confirmButton: 'my-custom-confirm-button',
      cancelButton: 'my-custom-cancel-button',
    },
  });

  /**
   * Mostrar una notificación de éxito
   */
  success(titulo: string, mensaje: string) {
    this.notificationMixin.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
    });
  }

  /**
   * Mostrar una notificación de error
   */
  error(titulo: string, mensaje: string, mensajeOk: string = 'OK') {
    const dialogPane = this.getActiveDialogPane();
    const themeColors = this.getThemeColors();
    return this.notificationMixinSeleccion.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      target: dialogPane ?? this.getAlertTarget(),
      backdrop: dialogPane ? false : true,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: mensajeOk,
      background: themeColors.background,
      color: themeColors.color,
      confirmButtonColor: themeColors.confirmButtonColor,
    });
  }

  /**
   * Mostrar una notificación de advertencia
   */
  warning(titulo: string, mensaje?: string) {
    const themeColors = this.getThemeColors();
    return this.notificationMixin.fire({
      icon: 'warning',
      title: titulo,
      ...(mensaje ? { text: mensaje } : {}),
      background: themeColors.background,
      color: themeColors.color,
      confirmButtonColor: themeColors.confirmButtonColor,
    });
  }

  /**
   * Mostrar una notificación de información
   */
  info(titulo: string, mensaje: string) {
    const themeColors = this.getThemeColors();
    this.notificationMixin.fire({
      icon: 'info',
      title: titulo,
      text: mensaje,
      background: themeColors.background,
      color: themeColors.color,
      confirmButtonColor: themeColors.confirmButtonColor,
    });
  }

  async confirmacionSelectiva(
    titulo: string,
    mensaje: string,
    textoAceptar: string = 'Aceptar',
    textoCancelar: string = 'Cancelar',
  ): Promise<boolean> {
    const themeColors = this.getThemeColors();
    const result = await this.notificationMixinSeleccion.fire({
      icon: 'warning',
      title: titulo,
      text: mensaje,
      confirmButtonColor: themeColors.confirmButtonColor,
      cancelButtonColor: themeColors.cancelButtonColor,
      confirmButtonText: textoAceptar,
      cancelButtonText: textoCancelar,
      background: themeColors.background,
      color: themeColors.color,
    });
    return result.isConfirmed;
  }

  async confirmacion(
    titulo: string,
    mensaje: string,
    textoAceptar: string = 'OK',
  ): Promise<boolean> {
    const themeColors = this.getThemeColors();
    const result = await this.notificationMixinSeleccion.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonColor: themeColors.confirmButtonColor,
      confirmButtonText: textoAceptar,
      showCancelButton: false,
      background: themeColors.background,
      color: themeColors.color,
    });
    return result.isConfirmed;
  }
}
