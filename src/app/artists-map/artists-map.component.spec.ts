import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistsMapComponent } from './artists-map.component';

describe('ArtistsMapComponent', () => {
  let component: ArtistsMapComponent;
  let fixture: ComponentFixture<ArtistsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
