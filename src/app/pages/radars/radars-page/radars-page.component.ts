/** Libraries */
import { Component, computed, effect, ViewChild } from '@angular/core'
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { skip } from 'rxjs'

/** Services */
import { ApiService, AuthService, GlobalStateService, RadarService, SnackbarsService, TenantsService } from '../../../services'

/** Models */
import { RadarConfig, RadarConfigGroup, RadarConfigGroupToTreeNodeAdapter, Settings, Tenant, TreeNode, User } from '../../../models'

/** Components */
import { HeaderComponent, SidebarComponent, ToggleComponent, DatepickerComponent, NotificationIconComponent } from '../../../components'

/** Utils */
import { DateUtils } from '../../../utils'

/** Component */
@Component({
  selector: 'app-radars-page',
  imports: [
    /** Components */
    HeaderComponent, SidebarComponent, ToggleComponent, DatepickerComponent, NotificationIconComponent,
    /**Directives */
    RouterLink, NgTemplateOutlet, RouterLinkActive,
    /** Pipes */
    TitleCasePipe
  ],
  templateUrl: './radars-page.component.html',
  styleUrl: './radars-page.component.scss'
})
export class RadarsPageComponent {
  /** User Interface */
  public navGroups: TreeNode[] = [];
  public config: RadarConfig | undefined;
  public currentImgType: 'Image' | 'Animation' = 'Image';

  public pageTitle: string = '';
  public imgUrl: string = '';

  /** Data */
  public user: User | null = null;
  public settings: Settings; // Recovered from route resolver in constructor

  public refreshId: number | null = null;
  private _radarConfigGroups: RadarConfigGroup[] = [];

  public referenceDate: Date | undefined;
  public selectedDate: Date | undefined;

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public retentionBridgeUrl; // Recovered from route resolver in constructor
  public radarImgsUrl = computed(() => this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.route.snapshot.data['apisConfig'].get('radarImgs')));

  private _selectedTenant; // Recovered from service in constructor
  public selectedTenantMsg; // Recovered from service in constructor
  public timePlayerRange = computed(() => {
    const selectedTenant: Tenant | null = this._selectedTenant();
    if (!selectedTenant) return this.settings.timeRangeDays ? this.settings.timeRangeDays * 1440 : 30 * 1440;
    return DateUtils.minutesBetweenTwoDates(new Date(selectedTenant.toDate), new Date(selectedTenant.fromDate));
  });

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChild('toggle') _toggle!: ToggleComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private tenantsService: TenantsService,
    private globalStateService: GlobalStateService,
    private radarService: RadarService,
    private snackbarsService: SnackbarsService,
  ) {
    /** Recovering from services */
    this._selectedTenant = this.tenantsService.selectedTenant;
    this.selectedTenantMsg = this.tenantsService.message;
    this.referenceDate = this.tenantsService.selectedTenant() ? new Date(this.tenantsService.selectedTenant()!.toDate) : undefined;

    /** Recovering data from resolvers */
    this.settings = this.route.snapshot.data['settings'];

    this._radarConfigGroups = this.route.snapshot.data['radarConfigGroups'];
    this.pageTitle = this.route.snapshot.data['type'];

    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.retentionBridgeUrl = this.route.snapshot.data['apisConfig'].get('retentionBridge');

    /** Effetcs */
    effect(() => this.user = this.authService.user());
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    const configGroup: RadarConfigGroup | undefined = this._initConfigGroup(this.pageTitle ?? 'radar');
    if (!configGroup || !configGroup.options.every((c: RadarConfig | RadarConfigGroup) => c instanceof RadarConfigGroup)) return;

    this.navGroups = configGroup.options.map((g: RadarConfigGroup) => RadarConfigGroupToTreeNodeAdapter.convert(g));
    this.route.paramMap.pipe(skip(1)).subscribe(() => {
      this.referenceDate = this.globalStateService.getDateFromQueryParams();
      const param: string | null = this.route.snapshot.paramMap.get('id');
      const imagetype: string | null = this.route.snapshot.queryParamMap.get('imagetype');
      if (param) this._init(param, imagetype && this._isImageType(imagetype) ? imagetype : 'Image');
    });

    this.route.queryParams.subscribe(() => {
      // this.referenceDate = this.globalStateService.getDateFromQueryParams();
      const dateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
      const date: Date | undefined = !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : undefined;

      const tenantDate = this._selectedTenant() ? new Date(this._selectedTenant()!.toDate) : undefined;
      const newDate = !date && tenantDate ? tenantDate : date;
      this.selectedDate = !date && tenantDate ? tenantDate : date;
      this.referenceDate = newDate ? new Date(newDate) : undefined;

      const param = this.route.snapshot.paramMap.get('id');
      const imagetype: string | null = this.route.snapshot.queryParamMap.get('imagetype');
      if (param) this._init(param, imagetype && this._isImageType(imagetype) ? imagetype : 'Image');
    });
  }

  public ngAfterViewInit(): void {
    const imagetype: string | null = this.route.snapshot.queryParamMap.get('imagetype');
    if (imagetype) this._toggle.setValue(imagetype);
  }

  public ngOnDestroy(): void {
    this._clearRefreshInterval();
  }

  /** Methods */
  private async _init(id: string, imagetype: typeof this.currentImgType = 'Image'): Promise<void> {
    if (this._sidebar) this._sidebar.toggleSidebar(false);
    const config = this._initConfig(id);
    if (!config) return;
    this.config = config;
    this._clearRefreshInterval();
    this._getRadarImg(this._createUrl(this.config.url, imagetype, this.referenceDate));
    if (!this.referenceDate) this.refreshId = window.setInterval(() => this._getRadarImg(this._createUrl(config.url, this.currentImgType, this.referenceDate)), 300000);
  }

  private _initConfigGroup(id: string): RadarConfigGroup | undefined {
    const config: RadarConfigGroup | undefined = this._radarConfigGroups.find(g => g.id === id);

    if (!config) {
      this._radarConfigGroups.length > 0 ? this.router.navigateByUrl(`/${id}/${this._radarConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
  }

  private _initConfig(id: string): RadarConfig | undefined {
    const config = this._radarConfigGroups
      .map((g: RadarConfigGroup) => g.getRadarConfig(id))
      .find((g) => g !== undefined);
    if (!config) {
      this._radarConfigGroups.length > 0 ? this.router.navigateByUrl(`/radar/${this._radarConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
  }

  private _clearRefreshInterval(): void {
    if (this.refreshId !== null) {
      window.clearInterval(this.refreshId);
      this.refreshId = null;
    }
  }

  public onToggleChanged(id: string) {
    this.currentImgType = (id === 'Image' || id === 'Animation') ? id : this.currentImgType;
    this.globalStateService.updateQueryParam2('imagetype', [this.currentImgType]);
  }

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    const current = this.globalStateService.getQueryParam2('date')[0];
    if (current === dateString) return;
    this.globalStateService.updateQueryParam2('date', dateString ? dateString : '');
  }

  private _createUrl(baseUrl: string, imgType: string, date: Date | undefined) {
    const endpoint = this.apiService.replaceApiUrlPlaceholder(baseUrl, imgType);
    const url: string = this.apiService.replaceApiUrlPlaceholder(this.radarImgsUrl(), endpoint);
    return this.apiService.addSearchParamsToUrl(url, { date: date ? date.toISOString() : new Date().toISOString() });
  }

  private _getRadarImg(url: string) {
    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento immagine del radar.', 'loader', false);
    this.radarService.getRadarImg(url, this.authService.getAccessToken())
      .then((imgUrl: string) => {
        this.imgUrl = imgUrl;
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.cause === 404) this.snackbarsService.createSnackbar(`Immagine non trovata per la data selezionata.`, 'error', true);
        else this.snackbarsService.createSnackbar(`Errore nel recupero delle immagini del radar.`, 'error', true);
        this.imgUrl = '';
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
      });
  }

  private _isImageType(value: any): value is typeof this.currentImgType {
    return value === 'Image' || value === 'Animation';
  }
}