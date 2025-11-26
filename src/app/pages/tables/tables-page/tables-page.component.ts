// Libraries
import { Component, effect } from '@angular/core';
import { DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Models
import { Table, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode } from '../../../models';

// Services
import { ApiService, AuthService } from '../../../services';

// Components
import { HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, InputAutocompleteComponent } from '../../../components';

// Directives
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive';
import { MapValuePipe } from '../../../pipes';

// Component
@Component({
  selector: 'app-tables-page',
  imports: [
    // Libraries
    ReactiveFormsModule,
    // Components
    HeaderComponent,
    SidebarComponent,
    SortableTableComponent,
    SortHeaderComponent,
    InputAutocompleteComponent,
    // Pipes
    KeyValuePipe,
    DatePipe,
    MapValuePipe,
    // Directives
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    ScrollableTableDirective,
  ],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.scss'
})
export class TablesPageComponent {
  /** User Interface */
  public navGroups: TreeNode[] = [];
  public filters: FormGroup = new FormGroup({});

  /** Data */
  public user: Record<string, any> | null = null;

  public data: Table = new Table();
  public sortedData: Table = new Table();
  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor
  public filterKeys: Record<string, { id: string, label?: string }[]> = {};
  public updateTime: Date = new Date();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    // Get data from resolvers
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  // Component lifecycle
  public async ngOnInit(): Promise<void> {   
    this.navGroups = this._tableConfigGroups.map((g: TableConfigGroup) => TableConfigGroupToTreeNodeAdapter.convert(g));

    this.route.paramMap.subscribe((params: ParamMap) => {
      const param: string | null = this.route.snapshot.paramMap.get('id');
      if (param) this._init(param);
    });
  }

  // Methods
  private async _init(id: string): Promise<void> {
    const config: TableConfig | undefined = this._tableConfigGroups
      .map((g: TableConfigGroup) => g.getTableConfig(id))
      .find((g) => g !== undefined);

    if (!config) {
      this._tableConfigGroups.length > 0 ? this.router.navigateByUrl(`/tabelle/${this._tableConfigGroups[0].options[0].id}`) : '';
      return;
    } 

    const response = await this.apiService.getApiJSONData(config.url)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err);
      });

    this.data = this.sortedData = Table.generateTableStructure(response[config.dataField ?? config.id], 'name');
    this.updateTime = new Date(response['updateDateTime']);
    this.filterKeys = this._createFilterKeys(config.filterKeys ?? []);
    this.filters = this._createFilterForm(config.filterKeys ?? []);

    this.filters.valueChanges.subscribe((changes: any) => {
      this.sortedData = this.data.filterTableData(changes);
    });
  }

  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.sortedData = this.sortedData.sortTableData(sort.sortBy, sort.direction);
  }

  private _createFilterForm(filterKeys: string[]): FormGroup {
    const controls = filterKeys.reduce((acc: Record<string, any>, curr: string) => {
      acc[curr] = new FormControl('');
      return acc;
    }, {});
    return new FormGroup(controls);
  }

  private _createFilterKeys(filterKeys: string[]) {
    return filterKeys.reduce((acc: Record<string, { id: string, label?: string }[]>, curr: string) => {
      acc[curr] = this.data.extractAllValuesByKey(curr).map((v: string) => ({ id: v }));
      return acc;
    }, {});
  }
}