import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTimePlayerComponent } from './map-time-player.component';

describe('MapTimePlayerComponent', () => {
  let component: MapTimePlayerComponent;
  let fixture: ComponentFixture<MapTimePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapTimePlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapTimePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
