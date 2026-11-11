import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Createreply } from './createreply';

describe('Createreply', () => {
  let component: Createreply;
  let fixture: ComponentFixture<Createreply>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createreply],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Createreply);
    fixture.componentRef.setInput('commentId', 'test-comment-id');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
