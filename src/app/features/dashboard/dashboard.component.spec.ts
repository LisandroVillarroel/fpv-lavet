import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import DashboardComponent from './dashboard.component';
import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: AuthTokenService,
          useValue: {
            initializeFromRoute: vi.fn(),
            getStorage: vi.fn().mockReturnValue(null),
            clear: vi.fn(),
            redirectToPortal: vi.fn(),
            persistToken: vi.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getProfile: vi.fn().mockReturnValue(of(null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
