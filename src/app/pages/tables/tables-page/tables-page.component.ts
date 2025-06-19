// Libraries
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Models
import { Table } from '../../../models';

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
    ReactiveFormsModule,
    HeaderComponent,
    SidebarComponent,
    SortableTableComponent,
    SortHeaderComponent,
    InputAutocompleteComponent,
    ScrollableTableDirective,
  ],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.scss'
})
export class TablesPageComponent {
  /** User Interface */
  public filters: FormGroup;

  /** Data */
  private _apis: any; // Recovered from route resolver in constructor

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    ////////// Filters testing
    this.filters = this.fb.group({
      name: [''],
      code: [''],
      city: [''],
      province: [''],
      area: [''],
      basin: ['']
    });

    this.filters.valueChanges.subscribe((changes: any) => {
      console.log(changes);
    });
    //////////

    this._apis = this.route.snapshot.data['apis'];
  }

  ////////// Mock data
  public rawData: any[] = [
    {
      name: 'Airole',
      code: 'AIROL',
      city: 'Airole',
      province: 'IM',
      area: 'A',
      zone: 'Roya',
      subZone: 'Roya',
      last: 0.0,
      max: 0.0,
      min: 0.0
    },
    {
      name: 'Bordighera',
      code: 'BORDG',
      city: 'Bordighera',
      province: 'IM',
      area: 'B',
      zone: 'Ponente',
      subZone: 'Ligure',
      last: 12.5,
      max: 23.4,
      min: 5.1
    },
    {
      name: 'Sanremo',
      code: 'SANRM',
      city: 'Sanremo',
      province: 'IM',
      area: 'C',
      zone: 'Riviera',
      subZone: 'Ligure',
      last: 18.3,
      max: 25.0,
      min: 10.2,
      test: 'VAL'
    }
  ];
  public data: Table = new Table();
  public sortedData: Table = new Table();
  //////////

  // Component lifecycle
  public async ngOnInit(): Promise<void> {
    this.data = this.sortedData = Table.generateTableStructure(this.rawData);

    this._getTableData(this._apis.get('stazioni'))
      .then((data: any) => {
        console.log(data);        
        this.data = this.sortedData = Table.generateTableStructure(data['tableRows']);
      })
  }

  // Methods
  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.sortedData = this.data.sortTableData(sort.sortBy, sort.direction);
  }

  private async _getTableData(url: string) {
    return this.apiService.getTableData(url)
      .then((value: any) => value)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err)
      })
  }
}