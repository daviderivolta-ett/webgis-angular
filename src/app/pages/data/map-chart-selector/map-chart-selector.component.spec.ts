import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapChartSelectorComponent } from './map-chart-selector.component';

describe('MapChartSelectorComponent', () => {
  let component: MapChartSelectorComponent;
  let fixture: ComponentFixture<MapChartSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapChartSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapChartSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
