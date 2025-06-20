// Libraries
import { Component } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Models
import { Table, TablesConfig } from '../../../models';

// Services
import { ApiService } from '../../../services';

// Components
import { HeaderComponent } from '../../../components/header/header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { SortableTableComponent } from "../../../components/sortable-table/sortable-table.component";
import { SortHeaderComponent } from '../../../components/sort-header/sort-header.component';
import { InputAutocompleteComponent } from '../../../components/input-autocomplete/input-autocomplete.component';

// Directives
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive';

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
    // Directives
    ScrollableTableDirective,
  ],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.scss'
})
export class TablesPageComponent {
  /** User Interface */
  public filters: FormGroup = new FormGroup({});

  /** Data */
  private _apis: any; // Recovered from route resolver in constructor
  private _tablesConfig: TablesConfig; // Recovered from route resolver in constructor
  public filterKeys: Record<string, { id: string, label?: string }[]> = {};

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    ////////// Filters testing
    // this.filters = this.fb.group({
    //   name: [''],
    //   code: [''],
    //   city: [''],
    //   province: [''],
    //   area: [''],
    //   basin: ['']
    // });

    // this.filters.valueChanges.subscribe((changes: any) => {
    //   console.log(changes);
    // });
    //////////

    // Get data from resolvers
    this._apis = this.route.snapshot.data['apis'];
    this._tablesConfig = this.route.snapshot.data['tablesConfig'];
  }

  ////////// Mock data
  public data: Table = new Table();
  public sortedData: Table = new Table();
  //////////

  // Component lifecycle
  public async ngOnInit(): Promise<void> {
    const path: string = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;

    this.data = this.sortedData = await this._getTableData(this._apis.get(path))
      .then((data: any) => {
        return Table.generateTableStructure(data['tableRows'], 'name');
      })
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati');
      });

    this.filterKeys = this._createFilterKeys();
    this.filters = this._createFilterForm();
    this.filters.valueChanges.subscribe((changes: any) => {
      this.sortedData = this.data.filterTableData(changes);
    });
  }

  // Methods
  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.sortedData = this.sortedData.sortTableData(sort.sortBy, sort.direction);
  }

  private async _getTableData(url: string) {
    return this.apiService.getTableData(url)
      .then((value: any) => value)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err)
      })
  }

  private _createFilterForm(): FormGroup {
    const controls = this._tablesConfig.filterKeys.reduce((acc: Record<string, any>, curr: string) => {
      acc[curr] = new FormControl('');
      return acc;
    }, {});
    return new FormGroup(controls);
  }

  private _createFilterKeys() {
    return this._tablesConfig.filterKeys.reduce((acc: Record<string, { id: string, label?: string }[]>, curr: string) => {
      acc[curr] = this.data.extractAllValuesByKey(curr).map((v: string) => ({ id: v }));
      return acc;
    }, {});
  }
}