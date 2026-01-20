import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesHydroPageComponent } from './tables-hydro-page.component';

describe('TablesHydroPageComponent', () => {
  let component: TablesHydroPageComponent;
  let fixture: ComponentFixture<TablesHydroPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesHydroPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesHydroPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
