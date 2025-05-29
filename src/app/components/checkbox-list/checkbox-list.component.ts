// Libraries
import { Component, effect, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Types
type CheckboxSingle = {
  id: string;
  label?: string,
  iconUrl?: string;
  maxSelections?: number,
  options?: CheckboxSingle[]
}

// Component
@Component({
  selector: 'app-checkbox-list',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './checkbox-list.component.html',
  styleUrl: './checkbox-list.component.scss'
})
export class CheckboxListComponent {
  public form: FormGroup;

  public parentGroup = input<FormGroup | null>(null);
  public iconUrl = input<string>();
  public maxSelections = input<number>(-1);
  public options = input<CheckboxSingle[]>([]);

  public changed = output<any>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});

    effect(() => {
      const controls: FormArray = this._createControls(this.options());
      const group: FormGroup = this.parentGroup() ?? this.fb.group({});
      group.setControl('options', controls, { emitEvent: false });
      this.form = group;

      this.form.valueChanges.subscribe((changes: any) => {
        if ('options' in changes) this._enforceMaxSelection(changes.options);
        if (!this.parentGroup()) this.changed.emit(changes);

      });

    });
  }

  // Getter and setter
  public get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  // Methods
  private _createControls(options: CheckboxSingle[]): FormArray {
    const formArray: FormArray = this.fb.array([]);

    options.forEach((option) => {
      if (option.options && option.options.length > 0) {
        const group: FormGroup = this.fb.group({
          options: this._createControls(option.options)
        });
        formArray.push(group, { emitEvent: false });
      } else {
        const group: FormGroup = this.fb.group({
          id: option.id,
          isChecked: false
        });
        formArray.push(group, { emitEvent: false });
      }
    });

    return formArray;
  }

  private _enforceMaxSelection(values: any[]): void {
    const selected: number = this._countSelected(values);

    if (this.maxSelections() === -1) return;

    const formArray: AbstractControl | null = this.form.get('options');
    if (!(formArray instanceof FormArray)) return;

    if (selected >= this.maxSelections()) {
      this._disableUncheckedControls(formArray);
    } else {
      this._enableControls(formArray);
    }
  }

  private _countSelected(values: any[], count: number = 0): number {
    values.forEach((value: any) => {
      if (typeof value === 'object' && 'isChecked' in value && value.isChecked) count++;
      if (typeof value === 'object' && 'options' in value) {
        count = this._countSelected(value.options, count);
      }
    })
    return count;
  }

  private _disableUncheckedControls(formArray: FormArray): void {
    formArray.controls.forEach((group: AbstractControl) => {
      if (!(group instanceof FormGroup)) return;

      // Disable checkbox if single
      const isChecked: AbstractControl | null = group.get('isChecked');
      if (isChecked && !isChecked.value)
        isChecked.disable({ emitEvent: false });

      // Disable group
      const nestedArray: AbstractControl | null = group.get('options');
      if (!(nestedArray instanceof FormArray)) return;

      nestedArray.controls.forEach((nestedGroup: AbstractControl) => {
        if (nestedGroup instanceof FormGroup) {
          const ic: AbstractControl | null = nestedGroup.get('isChecked');
          if (ic && !ic.value) ic.disable({ emitEvent: false });
        }
      });

    });
  }

  public _enableControls(formArray: FormArray): void {
    formArray.controls.forEach((group: AbstractControl) => {
      if (!(group instanceof FormGroup)) return;

      // Enable checkbox if single
      const isChecked: AbstractControl | null = group.get('isChecked');
      if (isChecked) isChecked.enable({ emitEvent: false });

      // Enable group
      const nestedArray: AbstractControl | null = group.get('options');
      if (!(nestedArray instanceof FormArray)) return;

      if ((nestedArray.value as Array<any>).some((value: any) => value.isChecked)) {
        return;
      } else {
        nestedArray.controls.forEach((nestedGroup: AbstractControl) => {
          if (nestedGroup instanceof FormGroup) {
            const ic = nestedGroup.get('isChecked');
            if (ic) ic.enable({ emitEvent: false });
          }
        });
      }
    });
  }
}