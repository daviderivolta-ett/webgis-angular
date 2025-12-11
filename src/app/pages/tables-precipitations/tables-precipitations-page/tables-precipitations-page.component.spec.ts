import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesPrecipitationsPageComponent } from './tables-precipitations-page.component';

describe('TablesPrecipitationsPageComponent', () => {
  let component: TablesPrecipitationsPageComponent;
  let fixture: ComponentFixture<TablesPrecipitationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesPrecipitationsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesPrecipitationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
