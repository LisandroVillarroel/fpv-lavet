import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AccessDeniedComponent } from './access-denied.component';
import { AuthTokenService } from '@core/services/auth-token.service';

describe('AccessDeniedComponent', () => {
  let component: AccessDeniedComponent;
  let fixture: ComponentFixture<AccessDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDeniedComponent],
      providers: [
        {
          provide: AuthTokenService,
          useValue: {
            redirectToPortal: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
