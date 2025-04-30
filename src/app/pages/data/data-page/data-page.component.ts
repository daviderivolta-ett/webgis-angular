// Libraries
import { Component, ViewChild } from '@angular/core';

// Components
import { HeaderComponent } from '../../../components/header/header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { MapComponent } from '../map/map.component';
import { PopUpMenuComponent } from '../../../components/pop-up-menu/pop-up-menu.component';
import { CheckboxListComponent } from '../../../components/checkbox-list/checkbox-list.component';

// Component
@Component({
  selector: 'app-data-page',
  imports: [
    HeaderComponent,
    SidebarComponent,
    MapComponent,
    PopUpMenuComponent,
    CheckboxListComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  public testData = [
    {
      id: 'station_temperature'
    },
    {
      id: 'station_wind'
    },
    {
      id: 'station_levels'
    },
    {
      id: 'station_humidity'
    },
    {
      id: 'map_precipitation',
      options: [
        {
          id: 'map_precipitation_0'
        },
        {
          id: 'map_precipitation_12'
        },
        {
          id: 'map_precipitation_18'
        }
      ],
      maxSelections: 1
    },
    {
      id: 'map_humidity',
      options: [
        {
          id: 'map_humidity_0'
        },
        {
          id: 'map_humidity_12'
        },
        {
          id: 'map_humidity_18'
        }
      ],
      maxSelections: 2
    }
  ];

  public test(value: any) {
    console.log('TEST', value);
  }
}