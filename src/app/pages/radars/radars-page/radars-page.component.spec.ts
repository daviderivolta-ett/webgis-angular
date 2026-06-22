import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadarsPageComponent } from './radars-page.component';

describe('RadarsPageComponent', () => {
  let component: RadarsPageComponent;
  let fixture: ComponentFixture<RadarsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadarsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
