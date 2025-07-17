import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsNavMenuComponent } from './settings-nav-menu.component';

describe('SettingsNavMenuComponent', () => {
  let component: SettingsNavMenuComponent;
  let fixture: ComponentFixture<SettingsNavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsNavMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
