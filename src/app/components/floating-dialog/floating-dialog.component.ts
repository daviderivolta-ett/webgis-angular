/** Libraries */
import { Component, ElementRef, output, ViewChild } from '@angular/core';
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
  private _isResizing: boolean = false;

  private _initialWidth: number = 0;
  private _initialHeight: number = 0;
  private _startX: number = 0;
  private _startY: number = 0;

  public removeDialog = output<void>();

  @ViewChild('floatingDialog') dialog!: ElementRef<HTMLDivElement>;

  public ngOnDestroy(): void {
    this.onResizeEnd();
  }

  private _onMouseMove = this.onResize.bind(this);
  private _onMouseUp = this.onResizeEnd.bind(this);

  public onResizeStart(event: MouseEvent): void {
    this._isResizing = true;

    this._initialWidth = this.dialog.nativeElement.offsetWidth;
    this._initialHeight = this.dialog.nativeElement.offsetHeight;
    this._startX = event.clientX;
    this._startY = event.clientY;

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
  }

  public onResize(event: MouseEvent): void {
    if (!this._isResizing) return;

    const deltaX = event.clientX - this._startX;
    const deltaY = event.clientY - this._startY;

    const maxWidth = window.innerWidth - this.dialog.nativeElement.offsetLeft;
    const maxHeight = window.innerHeight - this.dialog.nativeElement.offsetTop;

    const newWidth = Math.min(this._initialWidth + deltaX, maxWidth);
    const newHeight = Math.min(this._initialHeight + deltaY, maxHeight);

    this.dialog.nativeElement.style.width = `${newWidth}px`;
    this.dialog.nativeElement.style.height = `${newHeight}px`;
  }

  public onResizeEnd(): void {
    if (!this._isResizing) return;
    this._isResizing = false;

    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }
}