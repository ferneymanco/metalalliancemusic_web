import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfemeridesComponent } from './efemerides.component';

describe('EfemeridesComponent', () => {
  let component: EfemeridesComponent;
  let fixture: ComponentFixture<EfemeridesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfemeridesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfemeridesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
