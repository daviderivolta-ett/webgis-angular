import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesExtremesPageComponent } from './tables-extremes-page.component';

describe('TablesExtremesPageComponent', () => {
  let component: TablesExtremesPageComponent;
  let fixture: ComponentFixture<TablesExtremesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesExtremesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesExtremesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
