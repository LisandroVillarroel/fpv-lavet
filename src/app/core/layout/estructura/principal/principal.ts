import { Component, computed, inject, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Cabecera } from '../cabecera/cabecera';
import { Progreso } from '@core/guards/progreso';

///import { AppStore } from '../../../app.store';

@Component({
  selector: 'app-layout',
  imports: [
    Cabecera,
    MatSidenavModule,
    CustomSidenavComponent,
    RouterOutlet,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <app-cabecera [(collapsed)]="collapsed" />
    @if (progreso.isCargando()) {
    <div class="progress-wrapper absolute! top-[64px] z-10">
      <mat-progress-bar
        class="progreso-bar"
        color="primary"
        [mode]="progreso.porcentaje() > 0 ? 'determinate' : 'indeterminate'"
        [value]="progreso.porcentaje()"
      ></mat-progress-bar>
      <div class="progress-indicator" role="status" aria-live="polite">
        {{ progreso.porcentaje() }}%
      </div>
    </div>
    }

    <mat-sidenav-container>
      <mat-sidenav opened mode="side" [style.width]="sidenavWidth()">
        <app-custom-sidenav [collapsed]="collapsed()" />
      </mat-sidenav>

      <mat-sidenav-content class="content" [style.margin-left]="sidenavWidth()">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `

  :host {
    position: relative;
  }

  .progreso-bar {
    transition: width 300ms ease;
    /* suaviza la aparición de la barra */
    opacity: 0.98;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    height: 6px;
    border-radius: 4px;
    display: block;
    width: 100%;
  }

  .progress-indicator {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    font-size: 12px;
    font-weight: 600;
    color: var(--mat-sys-on-primary, #fff);
    background: rgba(0,0,0,0.35);
    padding: 2px 6px;
    border-radius: 4px;
    animation: pulseSmall 1.2s infinite ease-in-out;
    transition: transform 200ms ease, opacity 200ms ease;
  }

  .progress-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    display: block;
    /* espacio lateral para que la barra no toque los bordes */
  }

  @keyframes pulseSmall {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }


  .content {
    padding: 24px;
    box-sizing: border-box;
  }

  mat-sidenav-container {
    height: calc(100vh - 64px);
  }

  mat-sidenav-content {
    transition: margin-left 500ms ease-in-out !important;
  }

  mat-sidenav {
    transition: width 500ms ease-in-out !important;
  }

  mat-sidenav {
    --mat-sidenav-container-divider-color: var(--mat-sys-outline-variant);
    --mat-sidenav-container-shape: 0px;
  }

  @media screen and (max-width: 480px) {
    body, html {
      width: 100vw !important;
      max-width: 100vw !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
      margin-left: 65px !important;
    }
    :host {
      width: 100vw !important;
      max-width: 100vw !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }
    .content {
      padding: 4px !important;
    /*  margin: 0 !important;*/
      width: 100vw !important;
      max-width: 100vw !important;
    }
    mat-sidenav-container {
      height: calc(100vh - 48px) !important;
      min-height: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
    /*  margin: 0 !important;*/
      padding: 0 !important;
    }
    mat-sidenav-content {
      /*margin-left: 0 !important;*/
      min-width: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      /*margin: 0 !important;*/
      padding: 0 !important;
    }
    mat-sidenav {
      width: 60px !important;
      min-width: 0 !important;
      max-width: 60px !important;
    }
    app-cabecera, .mat-toolbar, .container-fluid {
      width: 100vw !important;
      max-width: 100vw !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      padding: 0 !important;
    }
  }

  `,
})
export default class Principal {
  collapsed = signal(false);
  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
  readonly progreso = inject(Progreso);
  ///  appStore = inject(AppStore);
}
