import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SharePost } from './share-post';

describe('SharePost', () => {
  let component: SharePost;
  let fixture: ComponentFixture<SharePost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharePost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SharePost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
