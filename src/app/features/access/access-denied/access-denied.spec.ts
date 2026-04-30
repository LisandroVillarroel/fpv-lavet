import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AccessDenied } from './access-denied';
import { AuthTokenService } from '@core/services/auth-token.service';

describe('AccessDenied', () => {
  let component: AccessDenied;
  let fixture: ComponentFixture<AccessDenied>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDenied],
      providers: [
        {
          provide: AuthTokenService,
          useValue: {
            redirectToPortal: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessDenied);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
