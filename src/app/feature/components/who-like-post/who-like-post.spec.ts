import { describe, beforeEach, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WhoLikePost } from './who-like-post';

describe('WhoLikePost', () => {
  let component: WhoLikePost;
  let fixture: ComponentFixture<WhoLikePost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoLikePost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(WhoLikePost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
