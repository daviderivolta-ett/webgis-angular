// Libraries
import { Component, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Models
import { Chip, Command, GroupedCheckboxItem, LayerGroup, MapConfig, TileLayer, WMSLayer } from '../../../models';

// Services
import { CommandsRegistryService, ConfigService } from '../../../services';

// Components
import { ChipComponent, GroupedCheckboxesComponent, HeaderComponent, PopUpMenuComponent, SidebarComponent } from '../../../components';
import { MapComponent } from '../map/map.component';
import { Utils } from '../../../utils';

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
    GroupedCheckboxesComponent,
    ChipComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  /*
  * Class properties
  */
  /** User Interface */
  public windowWidth: number;

  @ViewChild('map') _map!: MapComponent;
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  /** Data */
  public mapConfig: MapConfig; // Recovered from route resolver in constructor
  public groupedCheckboxes: GroupedCheckboxItem[] = []; // Recovered from route resolver in constructor
  public baseLayers: LayerGroup[]; // Recovered from route resolver in constructor
  public baseLayersForm: FormGroup = new FormGroup({
    baseLayer: new FormControl()
  });
  public infoLayers: WMSLayer[]; // Recovered from route resolver in constructor

  public currentLayers: Chip[] = [];

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private commandsRegistry: CommandsRegistryService
  ) {
    this.windowWidth = window.innerWidth;
    this.baseLayersForm.valueChanges.subscribe((changes: any) => this._onBaselayersRadioChange(changes));

    // Recovering data from resolvers
    this.mapConfig = this.route.snapshot.data['mapConfig'];
    this.baseLayers = this.route.snapshot.data['baseLayers'];
    this.infoLayers = this.route.snapshot.data['infoLayers'];
    // this.groupedCheckboxes = this.route.snapshot.data['groupedCheckboxes'];
    // this.baseLayers = [];
    // this.infoLayers = [];
    this.groupedCheckboxes = [];


    console.log(this.baseLayers);    
    console.log(this.infoLayers);    
  }

  // Component lifecycle
  public ngOnInit(): void {
    // console.log(this.groupedCheckboxes);
  }

  public ngAfterViewInit(): void {
    if (this.baseLayers.length > 0) this.baseLayersForm.get('baseLayer')?.setValue(this.baseLayers[0].options?.[0].id);
  }

  /*
  * Methods
  */
  /** Actions */
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

  public onMapLayerAdded(event: Record<string, any>): void {
    const id = event['id'];
    if (!id) return;
    const checkbox = this.groupedCheckboxes.find(group => group.getNestedCheckbox(id) !== undefined)?.getNestedCheckbox(id);
    let iconUrl: string = '';
    if (event['icon'] && event['icon'] instanceof SVGSVGElement) iconUrl = Utils.svgElementToImgSrc(event['icon']);
    if (!checkbox) return;
    const chip = new Chip(event['id'], checkbox.label ?? event['id'], iconUrl);
    this.currentLayers.push(chip);
  }

  public onMapLayerRemoved(event: Record<string, any>): void {
    const id = event['id'];
    if (!id) return;
    this.currentLayers = this.currentLayers.filter((c: Chip) => c.id !== id);
  }

  private _onBaselayersRadioChange(changes: any): void {
    // const layer: TileLayer | undefined = this.baseLayers.find((l: TileLayer) => l.id === changes['baseLayer']);
    // if (!layer) return;
    // const { id, label, url, ...rest } = layer;
    // this._map.addBaseLayer(url, rest);
  }

  public onInfoLayerCheckboxChange(event: Event, layer: WMSLayer): void {
    const value = (event.target as HTMLInputElement).checked;
    const { id, label, ...rest } = layer;
    if (value) this._map.addWMSLayer(id, this.configService.appConfig.urls.infoLayers, rest);
    else this._map.removeLayerById(id);
  }

  public onGroupCheckboxChange(data: any): void {    
    const { id, isChecked } = data;
    if (!id || typeof isChecked !== 'boolean') return;

    const ids: GroupedCheckboxItem[] = this.groupedCheckboxes.map((group: GroupedCheckboxItem) => group.getNestedCheckbox(id, group)).filter((v) => v !== undefined);
    if (ids.length === 0) return;

    const checkbox: GroupedCheckboxItem = ids[0];

    if (isChecked && checkbox.action && 'id' in checkbox.action) this._executeAction(checkbox)
    else this._map.removeLayerById(checkbox.id);

    // this._map.addTimeDimensionWMSLayer(
    //   'timedimension',
    //   'https://thredds.socib.es/thredds/wms/operational_models/oceanographical/wave/model_run_aggregation/sapo_ib/sapo_ib_best.ncd',
    //   {
    //     layers: 'significant_wave_height',
    //     format: 'image/png',
    //     transparent: true,
    //     colorscalerange: '0,3',
    //     abovemaxcolor: "extend",
    //     belowmincolor: "extend",
    //     numcolorbands: 100,
    //     styles: 'areafill/scb_bugnylorrd'
    //   }
    // );
  }

  /** Current layers chip dismiss */
  /** Search for checkbox in array, clone it and rebuild original checkboxes array */
  public onChipDismiss(id: string): void {
    const groupToUpdate = this.groupedCheckboxes.find(group => group.getNestedCheckbox(id));
    if (!groupToUpdate) return;
  
    const checkbox = groupToUpdate.getNestedCheckbox(id);
    if (!checkbox) return;
  
    const updatedCheckbox = checkbox.clone();
    updatedCheckbox.isChecked = false;
  
    const updatedGroup = groupToUpdate.clone();
    updatedGroup.options = updatedGroup.options?.map(opt =>
      opt.id === updatedCheckbox.id ? updatedCheckbox : opt
    );
  
    this.groupedCheckboxes = this.groupedCheckboxes.map(g =>
      g.id === updatedGroup.id ? updatedGroup : g
    );

    this._map.removeLayerById(checkbox.id);
  }

  private async _executeAction(checkbox: GroupedCheckboxItem): Promise<void> {
    const command: Command | null = this.commandsRegistry.getCommand(checkbox.action.id);
    if (!command) return;
    
    try {
      await command.execute({
        id: checkbox.id,
        map: this._map,
        ...checkbox.action.params ?? null
      });

    } catch (error) {
      console.log(error);
    }
  }
}