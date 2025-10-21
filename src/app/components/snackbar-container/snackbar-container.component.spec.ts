import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarContainerComponent } from './snackbar-container.component';

describe('SnackbarContainerComponent', () => {
  let component: SnackbarContainerComponent;
  let fixture: ComponentFixture<SnackbarContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbarContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnackbarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
