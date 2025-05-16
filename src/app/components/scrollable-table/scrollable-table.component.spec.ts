import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollableTableComponent } from './scrollable-table.component';

describe('ScrollableTableComponent', () => {
  let component: ScrollableTableComponent;
  let fixture: ComponentFixture<ScrollableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollableTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
