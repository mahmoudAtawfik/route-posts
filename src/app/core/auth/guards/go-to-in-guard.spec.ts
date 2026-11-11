import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { goToInGuard } from './go-to-in-guard';

describe('goToInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => goToInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
