// Libraries
import { Component } from '@angular/core';

// Components
import { HeaderComponent } from '../../../components/header/header.component';
import { ScrollableTableComponent } from "../../../components/scrollable-table/scrollable-table.component";

// Component
@Component({
  selector: 'app-tables-page',
  imports: [
    HeaderComponent,
    ScrollableTableComponent
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
      name: 'Airole',
      code: 'AIROL',
      citiy: 'Airole',
      province: 'IM',
      area: 'A',
      zone: 'Roya',
      subZone: 'Roya',
      last: '0.0',
      max: '0.0',
      min: '0.0',
      test: 'TEST'
    }
  ];
  //////////
}