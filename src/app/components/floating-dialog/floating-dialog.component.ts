/** Libraries */
import { Component } from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

/** Component */
@Component({
  selector: 'app-floating-dialog',
  imports: [
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './floating-dialog.component.html',
  styleUrl: './floating-dialog.component.scss'
})
export class FloatingDialogComponent {
  constructor() { }
}
