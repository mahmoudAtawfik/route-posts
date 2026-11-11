import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { goOutGuard } from './go-out-guard';

describe('goOutGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => goOutGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
