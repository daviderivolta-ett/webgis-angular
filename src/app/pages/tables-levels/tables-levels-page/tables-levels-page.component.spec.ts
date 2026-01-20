import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesLevelsPageComponent } from './tables-levels-page.component';

describe('TablesLevelsPageComponent', () => {
  let component: TablesLevelsPageComponent;
  let fixture: ComponentFixture<TablesLevelsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesLevelsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesLevelsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
