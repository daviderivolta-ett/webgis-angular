// Libraries
import { Component, effect, input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Types
type CheckboxSingle = {
  id: string;
  options?: CheckboxSingle[]
}

// Component
@Component({
  selector: 'app-checkbox-group',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.scss'
})
export class CheckboxGroupComponent {
  public form = input<FormGroup>(new FormGroup({
    options: new FormArray([])
  }));

  public options = input<CheckboxSingle[]>([]);
  public maxChoiches = input<number>(2);

  constructor(private fb: FormBuilder) {
    effect(() => this._createOptionControls(this.options(), this.optionsArray));
  }

  // Getter and setter
  public get optionsArray(): FormArray {
    return this.form().get('options') as FormArray;
  }

  // Methods
  private _createOptionControls(options: CheckboxSingle[], formArray: FormArray): void {
    options.forEach((option: CheckboxSingle) => {
      if (!option.options) {
        formArray.push(this.fb.group({
          id: option.id,
          isChecked: false
        }), { emitEvent: false });
      } else {
        const array: FormArray = this.fb.array([]);
        const group: FormGroup = this.fb.group({ options: array });

        formArray.push(group, { emitEvent: false });
      }
    });

    formArray.valueChanges.subscribe((changes: any) => {
      this._enforceMaxSelection(changes, formArray);
    });
  }

  private _enforceMaxSelection(values: any[], formArray: FormArray): void {
    console.log(values);    
    const selectedCount: number = this._countSelected(values);

    if (this.maxChoiches() !== -1) {

      if (selectedCount === this.maxChoiches()) {
        formArray.controls.forEach((group: AbstractControl) => {
          if (group instanceof FormGroup && 'isChecked' in group.value && !group.value.isChecked) {
            group.get('isChecked')?.disable({ emitEvent: false });
          }
        });
      } else {
        formArray.controls.forEach((group: AbstractControl) => {          
            group.get('isChecked')?.enable({ emitEvent: false });         
        });
      }
    }
  }

  private _countSelected(values: any[], count: number = 0): number {
    values.forEach((value: any) => {
      if (typeof value === 'object' && 'isChecked' in value && value.isChecked) count++;
    });
    return count;
  }
}