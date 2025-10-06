import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyLineComponent } from './plotly-line.component';

describe('PlotlyLineComponent', () => {
  let component: PlotlyLineComponent;
  let fixture: ComponentFixture<PlotlyLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotlyLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotlyLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
