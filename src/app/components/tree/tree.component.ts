/* Dependencies */
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  input,
  TemplateRef
} from '@angular/core';

/* Type */
type Tree = {
  id: string;
  label?: string;
  maxSelections?: number;
  options?: Tree[];
};

/* Component */
@Component({
  selector: 'app-tree',
  imports: [NgTemplateOutlet],
  templateUrl: './tree.component.html',

  styleUrl: './tree.component.scss',
})
export class TreeComponent {
  @ContentChild(TemplateRef) leafTemplate?: TemplateRef<any>;

  public tree = input<Tree>({ id: '' });
}
