import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyBarComponent } from './plotly-bar.component';

describe('PlotlyBarComponent', () => {
  let component: PlotlyBarComponent;
  let fixture: ComponentFixture<PlotlyBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotlyBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotlyBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
