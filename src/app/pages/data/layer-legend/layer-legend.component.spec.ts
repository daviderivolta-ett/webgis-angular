import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerLegendComponent } from './layer-legend.component';

describe('LayerLegendComponent', () => {
  let component: LayerLegendComponent;
  let fixture: ComponentFixture<LayerLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerLegendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
