import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnniversariesDetailComponent } from './anniversaries-detail.component';

describe('AnniversariesDetailComponent', () => {
  let component: AnniversariesDetailComponent;
  let fixture: ComponentFixture<AnniversariesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnniversariesDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnniversariesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
