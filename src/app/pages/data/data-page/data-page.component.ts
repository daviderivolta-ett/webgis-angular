// Libraries
import { Component, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Utils
import { Utils } from '../../../utils';

// Models
import { MapConfig, TileLayer, TreeNode, WMSLayer } from '../../../models';

// Services
import { ConfigService } from '../../../services';

// Components
import { CheckboxListComponent, GroupedCheckboxesComponent, HeaderComponent, PopUpMenuComponent, SidebarComponent } from '../../../components';
import { MapComponent } from '../map/map.component';

// Component
@Component({
  selector: 'app-data-page',
  imports: [
    // Libraries
    ReactiveFormsModule,
    
    // Components
    HeaderComponent,
    SidebarComponent,
    MapComponent,
    PopUpMenuComponent,
    CheckboxListComponent,
    GroupedCheckboxesComponent
],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  // User Interface
  public windowWidth: number;

  @ViewChild('map') _map!: MapComponent;
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  // Data
  public baseLayersForm: FormGroup = new FormGroup({
    selectedLayer: new FormControl()
  });

  public mapConfig: MapConfig; // Recovered from route resolver in constructor

  public baseLayers: TileLayer[]; // Recovered from route resolver in constructor
  public infoLayers: WMSLayer[]; // Recovered from route resolver in constructor
  public checkboxes: TreeNode[] = []; // Recovered from route resolver in constructor

  public currentLayers: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService
  ) {
    this.windowWidth = window.innerWidth;
    this.baseLayersForm.valueChanges.subscribe((changes: any) => this._onBaselayersRadioChange(changes));

    // Recovering data from resolvers
    this.mapConfig = this.route.snapshot.data['mapConfig'];
    this.baseLayers = this.route.snapshot.data['baseLayers'];
    this.infoLayers = this.route.snapshot.data['infoLayers'];
    this.checkboxes = this.route.snapshot.data['mapCheckboxes'];
  }

  // Component lifecycle
  public ngOnInit(): void {
    console.log(this.checkboxes);
  }

  public ngAfterViewInit(): void {
    if (this.baseLayers.length > 0) this.baseLayersForm.get('selectedLayer')?.setValue(this.baseLayers[0].id);
  }

  // Methods
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

  public onResetMapButtonClick(): void {
    this._map.resetMap();
  }

  private _onBaselayersRadioChange(changes: any): void {
    const layer: TileLayer | undefined = this.baseLayers.find((l: TileLayer) => l.id === changes['selectedLayer']);
    if (!layer) return;
    const { id, label, url, ...rest } = layer;
    this._map.addBaseLayer(url, rest);
  }

  public onMapLayersCheckboxListChange(data: any): void {
    // if ('options' in data && Array.isArray(data.options)) {
    //   const keys: string[] = Utils.getValuesByNestedKey(data.options, 'id', 'isChecked', 'options');
    //   const added: string[] = Utils.confrontArrays(this.currentLayers, keys).added;

    //   if (added.length > 0) {
    //     const checkbox: Checkbox | undefined = Checkbox.getCheckboxById(added[0], this.checkboxes);
    //     if (checkbox) checkbox.triggerAction();
    //   }

    //   this.currentLayers = [...keys];
    // }
  }

  public onInfoLayersCheckboxListChange(data: any): void {
    if ('options' in data && Array.isArray(data.options)) {
      const keys: string[] = Utils.getValuesByNestedKey(data.options, 'id', 'isChecked', 'options');
      const { added, removed } = Utils.confrontArrays(this.currentLayers, keys);

      this.currentLayers = [...keys];

      if (added.length > 0) this._addWMSLayersToMap(added, this.infoLayers);
      if (removed.length > 0) this._removeWMSLayersFromMap(removed, this.infoLayers);
    }
  }

  // Other methods
  // Map interactions
  private _addWMSLayersToMap(ids: string[], layers: WMSLayer[]): void {
    const layersToAdd: WMSLayer[] = Utils.findObjectsByIds(ids, layers);
    layersToAdd.forEach((layer: WMSLayer) => {
      const { id, label, ...rest } = layer;
      this._map.addWMSLayer(id, this.configService.appConfig.urls.infoLayers, rest);
    });
  }

  private _removeWMSLayersFromMap(ids: string[], layers: WMSLayer[]): void {
    const layersToRemove: WMSLayer[] = Utils.findObjectsByIds(ids, layers);
    layersToRemove.forEach((layer: WMSLayer) => this._map.removeLayerById(layer.id));
  }
}