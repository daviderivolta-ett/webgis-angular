/** Dependencies */
import { Component, ContentChildren, effect, input, QueryList } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/** Types */
interface Tab {
  id: string,
  label: string
}

/** Components */
import { TabComponent } from '../tab/tab.component'

/** Component */
@Component({
  selector: 'app-tabs',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {
  /** Properties */
  public tabs = input<Tab[]>([]);
  public form = new FormGroup({});

  /** View */
  @ContentChildren(TabComponent) _tabs!: QueryList<TabComponent>;

  /** Constructor */
  constructor() {
    effect(() => this._createFormGroup(this.tabs()))
    this.form.valueChanges.subscribe(() => {
      if (!this._tabs) return;
      const value = this.form.get('tab')?.value ?? '';     
      this._onTabChange(value);
    });
  }

  /** Getters and setters */
  public getTabs(): TabComponent[] {
    return this._tabs.toArray();
  }

  /** Component lifecycle */
  public ngAfterViewInit(): void {
    this.getTabs().forEach((tab: TabComponent, i: number) => {
      if (i === 0) tab.isVisible = true;
    });
  }

  /** Methods */
  private _createFormGroup(labels: Tab[]): void {
    if (labels.length === 0) return;
    if (!this.form.contains('tab')) this.form.addControl('tab', new FormControl(labels[0].id));
  }

  private _onTabChange(id: string): void {
    this.getTabs().forEach((tab: TabComponent) => {
      tab.isVisible = tab.tabId() === id ? true : false;
    })
  }
}