// Libraries
import { Component, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Models
import { Chip, Command, GroupedCheckboxItem, Layer, LayerCategory, LayerGroup, LayerGroupToCheckboxAdapter, MapConfig, TileLayer, WMSLayer } from '../../../models';

// Services
import { CommandsRegistryService, LayersService } from '../../../services';

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
  @ViewChildren('groupedCheckbox') _groupedCheckboxes!: QueryList<GroupedCheckboxesComponent>;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  /** Data */
  public mapConfig: MapConfig; // Recovered from route resolver in constructor
  public groupedCheckboxes: GroupedCheckboxItem[]; // Recovered from route resolver in constructor
  public baseLayers: TileLayer[]; // Recovered from route resolver in constructor
  public baseLayersForm: FormGroup = new FormGroup({
    baseLayer: new FormControl()
  });
  public infoLayers: WMSLayer[]; // Recovered from route resolver in constructor
  public dataLayers: LayerGroup[];


  // public currentLayers: Chip[] = [];




  private _layerCategories: Map<string, LayerCategory>; // Recovered from route resolver in constructor
  private _currentLayers: Map<string, string[]> = new Map();

  public chips: Chip[] = [];


  constructor(
    private route: ActivatedRoute,
    private layersService: LayersService,
    private commandsRegistry: CommandsRegistryService
  ) {
    this.windowWidth = window.innerWidth;
    this.baseLayersForm.valueChanges.subscribe((changes: any) => this._onBaselayersRadioChange(changes));

    // Recovering data from resolvers
    this.mapConfig = this.route.snapshot.data['mapConfig'];
    this.baseLayers = LayerGroup.getAllLayers(this.route.snapshot.data['baseLayers']).filter((l: Layer) => l instanceof TileLayer);
    this.infoLayers = LayerGroup.getAllLayers(this.route.snapshot.data['infoLayers']).filter((l: Layer) => l instanceof WMSLayer);
    this.dataLayers = this.route.snapshot.data['groupedCheckboxes'];
    this.groupedCheckboxes = this.dataLayers.map((v: LayerGroup) => LayerGroupToCheckboxAdapter.convert(v));


    this._layerCategories = new Map(this.route.snapshot.data['layerCategories'].map((c: LayerCategory) => [c.id, c]));
  }

  // Getter and setter
  public get currentLayers() {
    return {
      map: this._currentLayers,
      toArray: () => Array.from(this._currentLayers.values()).flat()
    }
  }

  // Component lifecycle
  public ngOnInit(): void {
    // console.log(this._layerCategories);
  }

  public ngAfterViewInit(): void {
    if (this.baseLayers.length > 0) this.baseLayersForm.get('baseLayer')?.setValue(this.baseLayers[0].id);
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
    this.chips.push(chip);
  }

  public onMapLayerRemoved(event: Record<string, any>): void {
    const id = event['id'];
    if (!id) return;
    this.chips = this.chips.filter((c: Chip) => c.id !== id);
  }

  private _onBaselayersRadioChange(changes: any): void {
    const layer: TileLayer | undefined = this.baseLayers.find((l: TileLayer) => l.id === changes['baseLayer']);
    if (!layer) return;
    const { id, label, url, ...rest } = layer;
    this._map.addBaseLayer(url, rest);
  }

  public onInfoLayerCheckboxChange(event: Event, layer: WMSLayer): void {
    const value = (event.target as HTMLInputElement).checked;
    const { id, url, params } = layer;
    if (value) this._map.addWMSLayer(id, url, params);
    else this._map.removeLayerById(id);
  }

  /** Check layer number in each categories in order to avoid layer number to overpass category number limit
    * Then redraw and reassign grouped checkboxes
    */
  public onGroupCheckboxChange(data: any): void {
    const { id, isChecked } = data;
    if (!id || typeof isChecked !== 'boolean') return;

    const layers: Layer[] = this.dataLayers.map((g: LayerGroup) => g.searchLayer(id, g)).filter((v) => v !== undefined);
    if (layers.length === 0) return;
    const layer: Layer = layers[0];

    this._currentLayers = this.layersService.checkLayerCategories(layer, isChecked, this._currentLayers, this._layerCategories);

    const currentCheckboxes: GroupedCheckboxItem[] = this._groupedCheckboxes.map((g) => GroupedCheckboxItem.createFromObject(g.group()));
    this.groupedCheckboxes = this._redrawGroupedCheckboxes(currentCheckboxes);

    const allLayers: Layer[] = LayerGroup.getAllLayers(this.dataLayers);

    allLayers.forEach((l: Layer) => {
      if (this.currentLayers.toArray().includes(l.id)) {
        if (!this._map.haslayer(l.id)) this._executeAction(l);
      } else {
        this._map.removeLayerById(l.id);
      }
    });


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

  private async _executeAction(layer: Layer): Promise<void> {
    if (!layer.action || !('id' in layer.action)) return;

    const command: Command | null = this.commandsRegistry.getCommand(layer.action.id);
    if (!command) return;

    try {
      await command.execute({
        map: this._map,
        ...layer
      });
    } catch (error) {
      console.log(error);
    }
  }

  private _redrawGroupedCheckboxes(groupedCheckboxes: GroupedCheckboxItem[]): GroupedCheckboxItem[] {
    const newCheckboxes: GroupedCheckboxItem[] = [];
    for (const group of groupedCheckboxes) {
      const newGroup = group.checkNestedCheckbox(this.currentLayers.toArray());
      newCheckboxes.push(newGroup)
    }
    return newCheckboxes;
  }
}