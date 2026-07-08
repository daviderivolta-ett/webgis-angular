/** Libraries */
import { Component, effect } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { createStationPopupConfigFromObject, StationPopupConfig, User } from '../../../models';

/** Services */
import { ApiService, Auth2Service, AuthService, PopupService, SnackbarsService, TenantsService } from '../../../services';

/** Components */
import { HeaderComponent, SettingsNavMenuComponent, SidebarComponent, LoadingBtnComponent, NotificationIconComponent } from '../../../components';

/** Pipes */
import { MapValuePipe } from '../../../pipes'

/** Component */
@Component({
  selector: 'app-popup-settings-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SettingsNavMenuComponent,
    NotificationIconComponent,
    /** Pipes */
    KeyValuePipe,
    MapValuePipe,
    /** Directives */
    ReactiveFormsModule,
    LoadingBtnComponent
],
  templateUrl: './popup-settings-page.component.html',
  styleUrl: './popup-settings-page.component.scss'
})
export class PopupSettingsPageComponent {
  /** UI */
  public form: FormGroup = new FormGroup({});

  public isLoading: boolean = false;
  public isConfigLoaded: boolean = false;

  /** Data */
  public user: User | null = null;

  public stationsApiBaseUrl: string; // Recovered from route resolver in constructor
  public popupConfig: Map<string, string>; // Recovered from route resolver in constructor
  public latestConfigUrl: string; // Recovered from route resolver in constructor
  public createConfigUrl: string; // Recovered from route resolver in constructor

  public selectedTenantMsg;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private auth2Service: Auth2Service,
    private apiService: ApiService,
    private tenantsService: TenantsService,
    private popupService: PopupService,
    private snackbarsService: SnackbarsService
  ) {
    this.selectedTenantMsg = this.tenantsService.message;

    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.popupConfig = this.route.snapshot.data['stationPopupConfig'];
    this.latestConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('latestConfig'));
    this.createConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('createConfig'));

    /** Effects */
    effect(() => {
      this.user = this.auth2Service.user();
    });
  }

  /** Component lifecycle */
  public ngAfterViewInit(): void {
    this.popupService.getLatestPopupConfig(this.apiService.addSearchParamsToUrl(this.latestConfigUrl, { Tag: 'popupConfig' }), this.auth2Service.getAccessToken())
      .then((config: any) => {                     
        this.form = this._createStationPopupConfigForm(config, this.popupConfig);
        this.isConfigLoaded = true;
      })
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel caricamento della configurazione del popup.`, 'error', false);
      })
  }

  /** Methods */
  private _createStationPopupConfigForm(config: StationPopupConfig, params: Map<string, string>): FormGroup {
    const formGroup = new FormGroup({});    

    for (const [id, _] of params.entries()) {
      const foundConfig: [string, boolean] | undefined = Object.entries(config).find(([k, _]: [string, boolean]) => k === id);
      if (foundConfig) formGroup.addControl(foundConfig[0], new FormControl(foundConfig[1]));
    };

    return formGroup;
  }

  public async onFormSubmit(): Promise<void> {
    this.isLoading = true;
    this.popupService.postPopupConfig(this.createConfigUrl, `popupConfig_${new Date().getTime()}`, 'popupConfig', 'prod', createStationPopupConfigFromObject(this.form.value), this.auth2Service.getAccessToken())
      .then(() => {
        this.snackbarsService.createSnackbar('Configurazione del popup salvata con successo', 'success', true);
      })
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel salvataggio della configurazione del popup`, 'error', true);
      })
      .finally(() => {
        this.form.markAsPristine();
        this.isLoading = false;
      })
  }
}