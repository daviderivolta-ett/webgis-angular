/* Dependencies */
import { Component, model, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Types */
type GroupedCheckbox = {
  id: string;
  label?: string;
  iconUrl?: string;
  options?: GroupedCheckbox[];
  maxSelections?: number;
  isChecked?: boolean;
  isDisabled?: boolean;
  isVisible?: boolean;
};

/* Component */
@Component({
  selector: 'app-grouped-checkboxes',
  imports: [NgTemplateOutlet, FormsModule],
  templateUrl: './grouped-checkboxes.component.html',

  styleUrl: './grouped-checkboxes.component.scss',
})
export class GroupedCheckboxesComponent {
  public group = model<GroupedCheckbox>({ id: '' });
  public changed = output<{ id: string; isChecked: boolean }>();

  /* Methods */
  public onCheckboxChange(group: GroupedCheckbox, event: Event): void {
    const value: boolean = (event.target as HTMLInputElement).checked;
    const parent: GroupedCheckbox | null = this._getParentGroup(this.group(), group);
    if (!parent || !parent.maxSelections || parent.maxSelections === -1) return;

    const parentSelected: number = this._countSelected(parent);

    if (parentSelected >= parent.maxSelections) {
      const newGroup = this._cloneGroupWithDisabledControls(parent);
      this.group.update((oldValue: GroupedCheckbox) => this._updateRootGroup(oldValue, newGroup));
    } else {
      const newSubtree = this._cloneGroupWithAllEnabled(parent);
      this.group.update((oldValue: GroupedCheckbox) => this._updateRootGroup(oldValue, newSubtree));
    }

    this.changed.emit({ id: group.id, isChecked: value });
  }

  private _updateRootGroup(oldValue: GroupedCheckbox, newGroup: GroupedCheckbox): GroupedCheckbox {
    if (oldValue.id === newGroup.id) return newGroup;

    return {
      ...oldValue,
      options: oldValue.options?.map((group: GroupedCheckbox) =>
        this._updateRootGroup(group, newGroup),
      ),
    };
  }

  private _getParentGroup(
    current: GroupedCheckbox,
    target: GroupedCheckbox,
  ): GroupedCheckbox | null {
    if (!current.options) return null;
    for (const child of current.options) {
      if (child === target) return current;
      const found = this._getParentGroup(child, target);
      if (found) return found;
    }
    return null;
  }

  private _countSelected(group: GroupedCheckbox, count: number = 0): number {
    if (group.isChecked) count++;

    if (group.options && Array.isArray(group.options)) {
      group.options.forEach((node: GroupedCheckbox) => {
        count = this._countSelected(node, count);
      });
    }

    return count;
  }

  private _cloneGroupWithDisabledControls(group: GroupedCheckbox): GroupedCheckbox {
    const isDisabled: boolean = group.isChecked ? false : true;

    return {
      ...group,
      options: group.options?.map((child: GroupedCheckbox) => {
        return this._cloneGroupWithDisabledControls(child);
      }),
      isDisabled,
    };
  }

  private _cloneGroupWithAllEnabled(group: GroupedCheckbox): GroupedCheckbox {
    return {
      ...group,
      isDisabled: false,
      options: group.options?.map((child) => this._cloneGroupWithAllEnabled(child)),
    };
  }
}
