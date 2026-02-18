/** Libraries */
import { Component, effect, ViewChild } from '@angular/core'
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Services */
import { ApiService, AuthService, GlobalStateService, RadarService, SnackbarsService } from '../../../services'

/** Models */
import { RadarConfig, RadarConfigGroup, RadarConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Components */
import { HeaderComponent, SidebarComponent, ToggleComponent, DatepickerComponent } from '../../../components'
import { skip } from 'rxjs'

/** Component */
@Component({
  selector: 'app-radars-page',
  imports: [
    /** Components */
    HeaderComponent, SidebarComponent, ToggleComponent, DatepickerComponent,
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
  public refreshId: number | null = null;
  private _radarConfigGroups: RadarConfigGroup[] = [];

  public referenceDate: Date | undefined;

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public radarImgsUrl; // Recovered from route resolver in constructor

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private globalStateService: GlobalStateService,
    private radarService: RadarService,
    private snackbarsService: SnackbarsService,
  ) {
    /** Recovering data from resolvers */
    this._radarConfigGroups = this.route.snapshot.data['radarConfigGroups'];
    this.pageTitle = this.route.snapshot.data['type'];

    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.radarImgsUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('radarImgs'));

    /** Effetcs */
    effect(() => this.user = this.authService.user());
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    const configGroup: RadarConfigGroup | undefined = this._initConfigGroup(this.pageTitle ?? 'radar');
    if (!configGroup || !configGroup.options.every((c: RadarConfig | RadarConfigGroup) => c instanceof RadarConfigGroup)) return;

    this.navGroups = configGroup.options.map((g: RadarConfigGroup) => RadarConfigGroupToTreeNodeAdapter.convert(g));
    this.route.paramMap.pipe(skip(1)).subscribe(() => {
      const param: string | null = this.route.snapshot.paramMap.get('id');
      if (param) this._init(param);
    });

    this.route.queryParams.subscribe(() => {
      this.referenceDate = this.globalStateService.getDateFromQueryParams();
      const param = this.route.snapshot.paramMap.get('id');
      if (param) this._init(param);
    });
  }

  public ngOnDestroy(): void {
    this._clearRefreshInterval();
  }

  /** Methods */
  private async _init(id: string): Promise<void> {
    if (this._sidebar) this._sidebar.toggleSidebar(false);
    const config = this._initConfig(id);
    if (!config) return;
    this.config = config;
    this._clearRefreshInterval();
    this._getRadarImg(this._createUrl(this.config.url, this.currentImgType, this.referenceDate));
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
    if (!this.config) return;
    this._getRadarImg(this._createUrl(this.config.url, id, this.referenceDate));
  }

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.globalStateService.setDateToQueryParams(new Date(dateString));
  }

  private _createUrl(baseUrl: string, imgType: string, date: Date | undefined) {
    const endpoint = this.apiService.replaceApiUrlPlaceholder(baseUrl, imgType);
    const url: string = this.apiService.replaceApiUrlPlaceholder(this.radarImgsUrl, endpoint);
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
}