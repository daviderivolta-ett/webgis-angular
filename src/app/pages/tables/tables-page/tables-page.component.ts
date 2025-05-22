// Libraries
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Utils
import { generateTableStructure, sortTableData, Table } from '../../../utils';

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
  public filters: FormGroup;

  constructor(private fb: FormBuilder) {
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
  public data: Table = { header: [], body: [] };
  public sortedData: Table = { header: [], body: [] };
  //////////

  // Component lifecycle
  public ngOnInit(): void {
    this.data = generateTableStructure(this.rawData);
    this.sortedData = { ...this.data };
  }

  // Methods
  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.sortedData = sortTableData(this.data, sort.sortBy, sort.direction);    
  }
}