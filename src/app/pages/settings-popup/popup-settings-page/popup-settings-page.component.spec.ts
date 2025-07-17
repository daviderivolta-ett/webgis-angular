import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSettingsPageComponent } from './popup-settings-page.component';

describe('PopupSettingsPageComponent', () => {
  let component: PopupSettingsPageComponent;
  let fixture: ComponentFixture<PopupSettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupSettingsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
