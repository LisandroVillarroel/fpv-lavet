import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import Dashboard from './dashboard';
import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
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

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
