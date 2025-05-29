// Libraries
import { Component, model, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Types
type TreeNode = {
  id: string;
  label?: string;
  maxSelections?: number,
  options?: TreeNode[],
  isChecked?: boolean,
  isDisabled?: boolean
}

// Component
@Component({
  selector: 'app-grouped-checkboxes',
  imports: [
    NgTemplateOutlet,
    FormsModule
  ],
  templateUrl: './grouped-checkboxes.component.html',
  styleUrl: './grouped-checkboxes.component.scss'
})
export class GroupedCheckboxesComponent {
  public tree = model<TreeNode>({ id: '' });
  public changed = output<any>();

  constructor() { }

  // Component lifecycle
  public ngOnInit(): void {
  }

  // Methods
  public onCheckboxChange(node: TreeNode, event: Event): void {
    const value: boolean = (event.target as HTMLInputElement).checked;
    const parent: TreeNode | null = this._getParentNode(this.tree(), node);
    if (!parent || !parent.maxSelections || parent.maxSelections === -1) return;

    const parentSelected: number = this._countSelected(parent);

    if (parentSelected >= parent.maxSelections) {
      const newNode = this._cloneTreeWithDisabledControls(parent);
      this.tree.update((oldValue: TreeNode) => this._updateRootTree(oldValue, newNode));
    } else {
      const newSubtree = this._cloneTreeWithAllEnabled(parent);
      this.tree.update((oldValue: TreeNode) => this._updateRootTree(oldValue, newSubtree));
    }

    this.changed.emit(node.id);
  }

  private _updateRootTree(oldValue: TreeNode, newNode: TreeNode): TreeNode {
    if (oldValue.id === newNode.id) return newNode;

    return {
      ...oldValue,
      options: oldValue.options?.map((node: TreeNode) => this._updateRootTree(node, newNode))
    }
  }

  private _getParentNode(current: TreeNode, target: TreeNode): TreeNode | null {
    if (!current.options) return null;
    for (const child of current.options) {
      if (child === target) return current;
      const found = this._getParentNode(child, target);
      if (found) return found;
    }
    return null;
  }

  private _countSelected(tree: TreeNode, count: number = 0): number {
    if (tree.isChecked) count++;

    if (tree.options && Array.isArray(tree.options)) {
      tree.options.forEach((node: TreeNode) => {
        count = this._countSelected(node, count);
      });
    }

    return count;
  }

  private _cloneTreeWithDisabledControls(tree: TreeNode): TreeNode {
    const isDisabled: boolean = tree.isChecked ? false : true;

    return {
      ...tree,
      options: tree.options?.map((node: TreeNode) => {
        return this._cloneTreeWithDisabledControls(node)
      }),
      isDisabled
    }
  }

  private _cloneTreeWithAllEnabled(tree: TreeNode): TreeNode {
    return {
      ...tree,
      isDisabled: false,
      options: tree.options?.map(child => this._cloneTreeWithAllEnabled(child))
    };
  }

}