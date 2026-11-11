import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftAside } from './left-aside';

describe('LeftAside', () => {
  let component: LeftAside;
  let fixture: ComponentFixture<LeftAside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftAside],
    }).compileComponents();

    fixture = TestBed.createComponent(LeftAside);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
