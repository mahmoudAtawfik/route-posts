import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddComment } from './add-comment';

describe('AddComment', () => {
  let component: AddComment;
  let fixture: ComponentFixture<AddComment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddComment],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddComment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
