// Libraries
import { Component, HostListener, ViewChild } from '@angular/core';

// Utils
import { confrontArrays, getUrlById, getValuesByNestedKey } from '../../../utils';

// Models
import { CheckboxSingle } from '../../../components/checkbox-list/checkbox-list.component';

// Services
import { ConfigService } from '../../../services/config.service';

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
    // Components
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
  // UI
  public windowWidth: number;

  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  // Data
  public variables: CheckboxSingle[] = [];
  public currentLayers: string[] = [];

  constructor(private configService: ConfigService) {
    this.windowWidth = window.innerWidth;
  }

  ////////// Mock data
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

  // Component lifecycle
  public ngOnInit(): void {
    this._getConfig('/configs/data.page/variables.json', (data: any) => {
      console.log(data);
      this.variables = [...data] as CheckboxSingle[];
    });
  }

  // Methods
  // Getting data
  private _getConfig(filename: string, callback: (data: any) => void) {
    this.configService.getConfig(filename)
      .subscribe({
        next: (data: any) => {
          callback(data)
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }

  // Actions
  public onMapClick(): void {
    this._sidebar.toggleSidebar(false);
    this._baseLayersMenu.togglePopUpMenu(false);
    this._infoLayersMenu.togglePopUpMenu(false);
  }

  public onSidebarToggle(isOpen: boolean): void {
    if (isOpen) {
      this._baseLayersMenu.togglePopUpMenu(false);
      this._infoLayersMenu.togglePopUpMenu(false);
    }
  }

  public onBaseLayersMenuToggle(isOpen: boolean): void {
    if (isOpen) {
      this._sidebar.toggleSidebar(false);
      this._infoLayersMenu.togglePopUpMenu(false);
    }
  }

  public onInfoLayersMenuToggle(isOpen: boolean): void {
    if (isOpen) {
      this._sidebar.toggleSidebar(false);
      this._baseLayersMenu.togglePopUpMenu(false);
    }
  }

  public onCheckboxListChange(data: any): void {
    if ('options' in data && Array.isArray(data.options)) {
      const keys: string[] = getValuesByNestedKey(data.options, 'id', 'isChecked', 'options');      
      const added: string[] = confrontArrays(this.currentLayers, keys).added;

      if (added.length > 0) {
        const url: string | null = getUrlById(added[0], this.variables);
        console.log(url);        
      }
      
      this.currentLayers = [...keys];
    }
  }
}