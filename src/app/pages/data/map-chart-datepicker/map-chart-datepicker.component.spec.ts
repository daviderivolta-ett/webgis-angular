import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapChartDatepickerComponent } from './map-chart-datepicker.component';

describe('MapChartDatepickerComponent', () => {
  let component: MapChartDatepickerComponent;
  let fixture: ComponentFixture<MapChartDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapChartDatepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapChartDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
