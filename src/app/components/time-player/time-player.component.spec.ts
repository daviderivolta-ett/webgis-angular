import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePlayerComponent } from './time-player.component';

describe('TimePlayerComponent', () => {
  let component: TimePlayerComponent;
  let fixture: ComponentFixture<TimePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
