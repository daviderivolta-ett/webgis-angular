/* Dependencies */
import { Component, ElementRef, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  public msg = signal<string>('');
  public confirmLabel = signal<string>('Conferma');
  public cancelLabel = signal<string>('Annulla');

  #resolve?: (value: boolean) => void;

  @ViewChild('dialog') _dialog!: ElementRef<HTMLDialogElement>;

  public open(msg: string, confirmLabel: string, cancelLabel: string): Promise<boolean> {
    this.msg.set(msg);
    this.confirmLabel.set(confirmLabel);
    this.cancelLabel.set(cancelLabel);
    this._dialog.nativeElement.showModal();

    return new Promise<boolean>((resolve) => {
      this.#resolve = resolve;
    });
  }

  public close(): void {
    this._dialog.nativeElement.close();
  }

  public onSubmit(event: SubmitEvent): void {
    const submitter = event.submitter as HTMLButtonElement;
    this.#resolve?.(submitter.value === 'confirm' ? true : false);
  }
}
