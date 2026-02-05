/** Libraries */
import { Component, effect } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { createStationPopupConfigFromObject, StationPopupConfig, User } from '../../../models';

/** Services */
import { ApiService, AuthService, PopupService, SnackbarsService } from '../../../services';

/** Components */
import { HeaderComponent, SettingsNavMenuComponent, SidebarComponent, LoadingBtnComponent } from '../../../components';

/** Component */
@Component({
  selector: 'app-popup-settings-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SettingsNavMenuComponent,
    /** Pipes */
    KeyValuePipe,
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
  public latestConfigUrl: string; // Recovered from route resolver in constructor
  public createConfigUrl: string; // Recovered from route resolver in constructor

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private popupService: PopupService,
    private snackbarsService: SnackbarsService
  ) {
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.latestConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('latestConfig'));
    this.createConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('createConfig'));

    /** Effects */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  /** Component lifecycle */
  public ngAfterViewInit(): void {
    this.popupService.getLatestPopupConfig(this.apiService.addSearchParamsToUrl(this.latestConfigUrl, { Tag: 'popupConfig' }), this.authService.getAccessToken())
      .then((config: any) => {
        this.form = this._createStationPopupConfigForm(config);
        this.isConfigLoaded = true;
      })
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel caricamento della configurazione del popup.`, 'error', false);
      })
  }

  /** Methods */
  private _createStationPopupConfigForm(config: StationPopupConfig): FormGroup {
    const formGroup = new FormGroup({});

    Object.entries(config).forEach(([k, v]: [string, boolean]) => {
      formGroup.addControl(k, new FormControl(v))
    });

    return formGroup;
  }

  public async onFormSubmit(): Promise<void> {
    this.isLoading = true;
    this.popupService.postPopupConfig(this.createConfigUrl, `popupConfig_${new Date().getTime()}`, 'popupConfig', 'dev', createStationPopupConfigFromObject(this.form.value), this.authService.getAccessToken())
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