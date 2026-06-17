import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { vi } from 'vitest';

import EmpresasStepper from './empresas-stepper';

@Component({
  selector: 'app-TituloComponentePopup',
  standalone: true,
  template: '',
})
class TituloComponentePopupStub {
  @Input() titulo = '';
}

@Component({
  selector: 'app-empresas-form',
  standalone: true,
  template: '',
})
class EmpresasFormStub {
  @Input() data:
    | {
        modo: 'agregar' | 'editar';
        empresa?: { _id?: string; tipoEmpresa?: string };
      }
    | undefined;

  @Output() formCompleted = new EventEmitter<unknown>();
  @Output() cancelarForm = new EventEmitter<void>();
  @Output() avanzarPermisos = new EventEmitter<void>();

  tipoEmpresaValue = 'Veterinaria';
  formInvalid = false;

  readonly empresaForm = {
    tipoEmpresa: () => ({
      value: () => this.tipoEmpresaValue,
    }),
  };

  isFormInvalid = () => this.formInvalid;
}

@Component({
  selector: 'app-empresas-permisos-menu',
  standalone: true,
  template: '',
})
class EmpresasPermisosMenuStub {
  @Input() modo: 'agregar' | 'editar' = 'agregar';
  @Input() empresa: unknown;
}

describe('EmpresasStepper', () => {
  let component: EmpresasStepper;
  let fixture: ComponentFixture<EmpresasStepper>;

  beforeEach(async () => {
    TestBed.overrideComponent(EmpresasStepper, {
      set: {
        imports: [
          MatStepperModule,
          EmpresasFormStub,
          EmpresasPermisosMenuStub,
          TituloComponentePopupStub,
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [EmpresasStepper],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            modo: 'editar',
            empresa: {
              _id: 'empresa-1',
              tipoEmpresa: 'Veterinaria',
            },
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresasStepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('permite avanzar al paso de permisos cuando la empresa editada ya fue guardada', () => {
    const formStub = fixture.debugElement.query(By.directive(EmpresasFormStub))
      .componentInstance as EmpresasFormStub;

    expect(component.canAdvanceToPermisos(formStub as never)).toBe(true);

    component.stepper.next();
    fixture.detectChanges();

    expect(component.stepper.selectedIndex).toBe(1);
  });

  it('bloquea el avance si el tipo de empresa cambió y aún falta guardar', () => {
    const formStub = fixture.debugElement.query(By.directive(EmpresasFormStub))
      .componentInstance as EmpresasFormStub;

    formStub.tipoEmpresaValue = 'Laboratorio';
    fixture.detectChanges();

    expect(component.canAdvanceToPermisos(formStub as never)).toBe(false);
  });
});
