import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnniversariesFormWysiwygComponent } from './anniversaries-form-wysiwyg.component';

describe('AnniversariesFormWysiwygComponent', () => {
  let component: AnniversariesFormWysiwygComponent;
  let fixture: ComponentFixture<AnniversariesFormWysiwygComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnniversariesFormWysiwygComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnniversariesFormWysiwygComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
