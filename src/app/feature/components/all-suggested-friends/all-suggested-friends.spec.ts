import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AllSuggestedFriends } from './all-suggested-friends';

describe('AllSuggestedFriends', () => {
  let component: AllSuggestedFriends;
  let fixture: ComponentFixture<AllSuggestedFriends>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSuggestedFriends],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllSuggestedFriends);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
