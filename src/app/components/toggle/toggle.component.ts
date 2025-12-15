/** Dependencies */
import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Types */
type Toggle = {
  id: string,
  label: string,
  iconUrl?: string
}

/** Component */
@Component({
  selector: 'app-toggle',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss'
})
export class ToggleComponent {
  public form: FormGroup = new FormGroup({ toggle: new FormControl() });
  public options = input<Toggle[]>([]);
  public isDisabled = input<boolean>(false);

  public toggleChanged = output<string>();

  constructor() {
    effect(() => this._initForm(this.form, 'toggle', this.options().map((t: Toggle) => t.id)));
    effect(() => this.isDisabled() ? this.form.get('toggle')?.disable() : this.form.get('toggle')?.enable());
    this.form.valueChanges.subscribe((changes: any) => this.toggleChanged.emit(changes['toggle']));
  }

  /** Methods */
  private _initForm(form: FormGroup, controlId: string, options: string[]): void {
    if (options.length === 0) return;
    form.patchValue({ [controlId]: options[0] });
  }
}