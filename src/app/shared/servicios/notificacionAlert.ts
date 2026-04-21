import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/**
 * Notificacion sevicio usando Signal
 * Gestiona las notificaciones de brindis de forma reactiva
 */
@Injectable({
  providedIn: 'root',
})
export class NotificacioAlertnService {
  private notificationMixin = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
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
    background: '#fff',
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
    this.notificationMixin.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      timer: 0,
      showConfirmButton: true,
      confirmButtonText: mensajeOk,
    });
  }

  /**
   * Mostrar una notificación de advertencia
   */
  warning(titulo: string, mensaje?: string) {
    return this.notificationMixin.fire({
      icon: 'warning',
      title: titulo,
      ...(mensaje ? { text: mensaje } : {}),
    });
  }

  /**
   * Mostrar una notificación de información
   */
  info(titulo: string, mensaje: string) {
    this.notificationMixin.fire({
      icon: 'info',
      title: titulo,
      text: mensaje,
    });
  }

  async confirmacionSelectiva(
    titulo: string,
    mensaje: string,
    textoAceptar: string = 'Aceptar',
    textoCancelar: string = 'Cancelar',
  ): Promise<boolean> {
    const result = await this.notificationMixinSeleccion.fire({
      icon: 'warning',
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#002464',
      cancelButtonColor: '#F45516',
      confirmButtonText: textoAceptar,
      cancelButtonText: textoCancelar,
    });
    return result.isConfirmed;
  }

  async confirmacion(
    titulo: string,
    mensaje: string,
    textoAceptar: string = 'OK',
  ): Promise<boolean> {
    const result = await this.notificationMixinSeleccion.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#002464',
      confirmButtonText: textoAceptar,
      showCancelButton: false,
    });
    return result.isConfirmed;
  }
}
