import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { App } from '@app/app';
import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';
import { ThemeService } from '@core/services/theme.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: AuthTokenService,
          useValue: {
            initializeFromRoute: vi.fn(),
            getStorage: vi.fn().mockReturnValue(null),
            persistToken: vi.fn(),
            clear: vi.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getProfile: vi.fn().mockReturnValue(of(null)),
          },
        },
        {
          provide: ThemeService,
          useValue: {
            syncThemeFromSession: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toBe('FPV Lavet');
  });
});
