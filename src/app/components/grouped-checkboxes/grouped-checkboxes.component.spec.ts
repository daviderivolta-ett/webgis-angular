import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedCheckboxesComponent } from './grouped-checkboxes.component';

describe('GroupedCheckboxesComponent', () => {
  let component: GroupedCheckboxesComponent;
  let fixture: ComponentFixture<GroupedCheckboxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupedCheckboxesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedCheckboxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
