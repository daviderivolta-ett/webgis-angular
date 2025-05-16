// Libraries
import { Component, HostListener, ViewChild } from '@angular/core';

// Components
import { HeaderComponent } from '../../../components/header/header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { MapComponent } from '../map/map.component';
import { PopUpMenuComponent } from '../../../components/pop-up-menu/pop-up-menu.component';
import { CheckboxListComponent } from '../../../components/checkbox-list/checkbox-list.component';
import { ChipComponent } from '../../../components/chip/chip.component';
import { RadioComponent } from '../../../components/radio/radio.component';

// Component
@Component({
  selector: 'app-data-page',
  imports: [
    HeaderComponent,
    SidebarComponent,
    MapComponent,
    PopUpMenuComponent,
    CheckboxListComponent,
    ChipComponent,
    RadioComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  public windowWidth: number;

  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  constructor() {
    this.windowWidth = window.innerWidth;
  }

  ////////// Mock data
  public stationsData = [
    {
      id: 'stations_precipitation',
      options: [
        {
          id: 'stations_precipitation_0'
        },
        {
          id: 'stations_precipitation_12'
        },
        {
          id: 'stations_precipitation_18'
        }
      ],
      maxSelections: 1
    },
    {
      id: 'station_humidity',
      options: [
        {
          id: 'station_humidity_0'
        },
        {
          id: 'station_humidity_12'
        },
        {
          id: 'station_humidity_18'
        }
      ],
      maxSelections: 2
    },
    {
      id: 'station_temperature'
    },
    {
      id: 'station_water-levels'
    },
    {
      id: 'station_wind'
    }
  ];

  public mapsData = [
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
      maxSelections: 1
    },
    {
      id: 'map_temperature',
      options: [
        {
          id: 'map_temperature_0'
        },
        {
          id: 'map_temperature_12'
        },
        {
          id: 'map_temperature_18'
        }
      ],
      maxSelections: 1
    }
  ];

  public infoLayers = [
    { id: 'reticolo_idrografico' },
    { id: 'piccoli_bacini_idrografici_modellati' },
    { id: 'bacini_idrografici' },
    { id: 'comuni' },
    { id: 'provincie' },
    { id: 'zone_di_allerta' },
    { id: 'comprensori_idrologici_base' },
    { id: 'grandi_dighe_interesse_ligure' },
    { id: 'aree_inondabili_30-50' },
    { id: 'aree_inondabili_200' },
    { id: 'aree_inondabili_500' },
    { id: 'esposti_rischio_inondazione' },
  ];
  //////////

  // Methods
  public handleMapClick(): void {
    this._sidebar.toggleSidebar(false);
    this._baseLayersMenu.togglePopUpMenu(false);
    this._infoLayersMenu.togglePopUpMenu(false);
  }

  public handleSidebarToggle(isOpen: boolean): void {
    if (isOpen) {
      this._baseLayersMenu.togglePopUpMenu(false);
      this._infoLayersMenu.togglePopUpMenu(false);
    }
  }

  public handleBaseLayersMenuToggle(isOpen: boolean): void {
    if (isOpen) {
      this._sidebar.toggleSidebar(false);
      this._infoLayersMenu.togglePopUpMenu(false);
    }
  }

  public handleInfoLayersMenuToggle(isOpen: boolean): void {
    if (isOpen) {
      this._sidebar.toggleSidebar(false);
      this._baseLayersMenu.togglePopUpMenu(false);
    }
  }
}