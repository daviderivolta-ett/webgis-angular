// Libraries
import { Component } from '@angular/core';

// Components
import { HeaderComponent } from '../../../components/header/header.component';
import { ScrollableTableComponent } from '../../../components/scrollable-table/scrollable-table.component';
import { SortHeaderComponent } from "../../../components/sort-header/sort-header.component";

// Component
@Component({
  selector: 'app-tables-page',
  imports: [
    HeaderComponent,
    ScrollableTableComponent,
    SortHeaderComponent
],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.scss'
})
export class TablesPageComponent {

  ////////// Mock data
  public data: Object[] = [
    {
      name: 'Airole',
      code: 'AIROL',
      citiy: 'Airole',
      province: 'IM',
      area: 'A',
      zone: 'Roya',
      subZone: 'Roya',
      last: '0.0',
      max: '0.0',
      min: '0.0'
    },
    {
      name: 'Bordighera',
      code: 'BORDG',
      citiy: 'Bordighera',
      province: 'IM',
      area: 'B',
      zone: 'Ponente',
      subZone: 'Ligure',
      last: '12.5',
      max: '23.4',
      min: '5.1'
    },
    {
      name: 'Sanremo',
      code: 'SANRM',
      citiy: 'Sanremo',
      province: 'IM',
      area: 'C',
      zone: 'Riviera',
      subZone: 'Ligure',
      last: '18.3',
      max: '25.0',
      min: '10.2',
      test: 'VAL'
    }
  ];
  //////////
}