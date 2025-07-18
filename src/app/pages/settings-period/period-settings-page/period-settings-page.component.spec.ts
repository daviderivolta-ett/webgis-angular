import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSettingsPageComponent } from './period-settings-page.component';

describe('PeriodSettingsPageComponent', () => {
  let component: PeriodSettingsPageComponent;
  let fixture: ComponentFixture<PeriodSettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodSettingsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
