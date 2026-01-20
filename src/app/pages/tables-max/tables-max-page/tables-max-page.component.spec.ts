import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesMaxPageComponent } from './tables-max-page.component';

describe('TablesMaxPageComponent', () => {
  let component: TablesMaxPageComponent;
  let fixture: ComponentFixture<TablesMaxPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesMaxPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesMaxPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
