import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { FriendProfie } from './friend-profie';

describe('FriendProfie', () => {
  let component: FriendProfie;
  let fixture: ComponentFixture<FriendProfie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendProfie],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendProfie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
