import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesStationsPageComponent } from './tables-stations-page.component';

describe('TablesStationsPageComponent', () => {
  let component: TablesStationsPageComponent;
  let fixture: ComponentFixture<TablesStationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesStationsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesStationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
