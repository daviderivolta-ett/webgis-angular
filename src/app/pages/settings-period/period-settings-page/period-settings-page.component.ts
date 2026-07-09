/** Libraries */
import { Component, effect, Signal, signal, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

/** Services */
import { ApiService, Auth2Service, AuthService, GlobalStateService, SnackbarsService, TenantsService } from '../../../services'

/** Models */
import { Tenant, User } from '../../../models'

/** Directives */
import { ClickOutsideDirective } from '../../../directives/click-outside.directive'

/** Components */
import { HeaderComponent, SidebarComponent, SettingsNavMenuComponent, LoadingBtnComponent, ConfirmDialogComponent, NotificationIconComponent } from '../../../components'
import { TenantCardComponent } from '../tenant-card/tenant-card.component'

/** Component */
@Component({
  selector: 'app-period-settings-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SettingsNavMenuComponent,
    LoadingBtnComponent,
    TenantCardComponent,
    ConfirmDialogComponent,
    NotificationIconComponent,
    /** Directives */
    ReactiveFormsModule,
    ClickOutsideDirective
  ],
  templateUrl: './period-settings-page.component.html',
  styleUrl: './period-settings-page.component.scss'
})
export class PeriodSettingsPageComponent {
  /** UI */
  public form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    initialDate: new FormControl(this._fromDateToDatetimelocal(new Date()), [Validators.required]),
    endingDate: new FormControl(this._fromDateToDatetimelocal(new Date()), [Validators.required]),
    // alwaysAvailable: new FormControl(false)
  });

  /** Data */
  public user: User | null = null;

  public apiBaseUrl; // Recovered from route resolver in constructor
  public retentionApiBaseUrl; // Recovered from route resolver in constructor

  public tenantsUrl; // Recovered from route resolver in constructor
  public createTenantUrl; // Recovered from route resolver in constructor
  public loadTenantUrl; // Recovered from route resolver in constructor
  public unloadTenantUrl; // Recovered from route resolver in constructor
  public deleteTenantUrl; // Recovered from route resolver in constructor

  public tenants = signal<Tenant[]>([]);
  public selectedTenant; // Recovered from service in constructor
  public selectedTenantMsg; // Recovered from service in constructor

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private auth2Service: Auth2Service,
    private apiService: ApiService,
    private globalStateService: GlobalStateService,
    private tenantsService: TenantsService,
    private snackbarService: SnackbarsService
  ) {
    /** Recovering from services */
    this.selectedTenant = this.tenantsService.selectedTenant;
    this.selectedTenantMsg = this.tenantsService.message;

    /** Recovering data from resolvers */
    this.apiBaseUrl = this.route.snapshot.data['apisConfig'].get('baseUrl');
    this.retentionApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('retentionApi'));
    this.tenantsUrl = this.apiService.buildUrl(this.retentionApiBaseUrl, this.route.snapshot.data['apisConfig'].get('allTenants'));
    this.createTenantUrl = this.apiService.buildUrl(this.retentionApiBaseUrl, this.route.snapshot.data['apisConfig'].get('createTenant'));
    this.loadTenantUrl = this.apiService.buildUrl(this.retentionApiBaseUrl, this.route.snapshot.data['apisConfig'].get('loadTenant'));
    this.unloadTenantUrl = this.apiService.buildUrl(this.retentionApiBaseUrl, this.route.snapshot.data['apisConfig'].get('unloadTenant'));
    this.deleteTenantUrl = this.apiService.buildUrl(this.retentionApiBaseUrl, this.route.snapshot.data['apisConfig'].get('deleteTenant'));

    /** Effetcs */
    effect(() => this.user = this.auth2Service.user());
    effect(() => {
      const selectedTenant = this.selectedTenant();
      if (!selectedTenant) this.globalStateService.removeQueryParam('date');
      else this.globalStateService.updateQueryParam2('date', [this.globalStateService.toDatetimelocal(new Date(selectedTenant.toDate))]);
    })
  }

  /** References */
  @ViewChild('leftSidebar') _leftSidebar!: SidebarComponent;
  @ViewChild('rightSidebar') _rightSidebar!: SidebarComponent;
  @ViewChild('confirmDialog') _confirmDialog!: ConfirmDialogComponent;

  /** Component lifecycle */
  public ngOnInit(): void {
    this.#getAllTenants();
  }

  /** Methods */
  /** Init */
  #getAllTenants() {
    this.tenantsService.getAllTenants(this.tenantsUrl, this.auth2Service.token())
      .then((tenants: Tenant[]) => this.tenants.set(tenants.toSorted((a, b) => a.id.localeCompare(b.id))))
      .catch((err: unknown) => this.snackbarService.createSnackbar(err instanceof Error ? err.message : `Errore nel caricamento dei periodi salvati.`, 'error', true))
  }

  private _fromDateToDatetimelocal(date: Date): string {
    const newDate: Date = new Date(date);
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    return newDate.toISOString().slice(0, 16);
  }

  public onClickOutside(target: SidebarComponent) {
    if (target === this._rightSidebar) this._rightSidebar.toggleSidebar(false);
    if (target === this._leftSidebar) this._leftSidebar.toggleSidebar(false);
  }

  public selectTenant(id: string): void {
    this.tenantsService.toggleTenant(id);
  }

  public async onFormSubmit(): Promise<void> {
    const { name, initialDate, endingDate } = this.form.value;
    if (!name || !initialDate || !endingDate) return;
    const tenant: Pick<Tenant, 'fromDate' | 'toDate' | 'label'> = { fromDate: new Date(initialDate).toISOString(), toDate: new Date(endingDate).toISOString(), label: name };

    const result = await this._confirmDialog.open(`Si sta per creare il nuovo periodo salvato ${name}, da ${new Date(initialDate).toLocaleString()} a ${new Date(endingDate).toLocaleString()}. Questo processo può impiegare anche diverse ore. Sicuri di voler procedere?`, 'Sì, continua', 'No, annulla')

    if (!result) return;

    try {
      await this.tenantsService.createTenant(this.createTenantUrl, tenant, this.auth2Service.token());
      this.snackbarService.createSnackbar(`Periodo salvato creato; in attesa dell'elaborazione dei dati.`, 'success', true);
      this.#getAllTenants();
    } catch (error) {
      this.snackbarService.createSnackbar(`Errore nella creazione del periodo salvato.`, 'error', true);
    }
  }

  public async loadTenant(id: string): Promise<void> {
    try {
      const result = await this._confirmDialog.open('Si sta per rendere disponibile il periodo salvato selezionato. Il processo di raccolta dei dati può durare anche alcune ore. Continuare?', 'Sì, continua', 'No, annulla');
      if (!result) return;
      await this.tenantsService.loadTenant(this.apiService.replaceApiUrlPlaceholder(this.loadTenantUrl, id), this.auth2Service.token());
      this.tenants.update((oldValue: Tenant[]) => oldValue.map((t) => t.id === id ? { ...t, isEnabled: false } : t));
      this.snackbarService.createSnackbar(`Periodo salvato caricato. In attesa dell'elaborazione dei dati.`, 'success', true);
    } catch (error) {
      this.snackbarService.createSnackbar(`Errore durante il caricamento del periodo salvato.`, 'error', true);
    }
  }

  public async unloadTenant(id: string): Promise<void> {
    try {
      const result = await this._confirmDialog.open(`Si sta per rendere non più disponibile il periodo salvato selezionato. L'eventuale processo di ricariamento dei dati può durare anche alcune ore. Continuare?`, 'Sì, continua', 'No, annulla');
      if (!result) return;
      await this.tenantsService.unloadTenant(this.apiService.replaceApiUrlPlaceholder(this.unloadTenantUrl, id), this.auth2Service.token());
      this.tenants.update((oldValue: Tenant[]) => oldValue.map((t) => t.id === id ? { ...t, isEnabled: false, isLoaded: false } : t));
      this.snackbarService.createSnackbar(`Periodo salvato scaricato. In attesa dell'elaborazione dei dati.`, 'success', true);
    } catch (error) {
      this.snackbarService.createSnackbar(`Errore durante lo scaricamento del periodo salvato.`, 'error', true);
    }
  }

  public async deleteTenant(id: string): Promise<void> {
    try {
      const result = await this._confirmDialog.open('Si è sicuri di voler eliminare il periodo salvato? Questa operazione non è reversibile.', 'Sì, elimina', 'No, annulla');
      if (!result) return;
      await this.tenantsService.deleteTenant(this.apiService.replaceApiUrlPlaceholder(this.deleteTenantUrl, id), this.auth2Service.token());
      this.tenants.update((oldValue: Tenant[]) => oldValue.filter((t: Tenant) => t.id !== id));
      this.snackbarService.createSnackbar(`Periodo salvato eliminato con successo.`, 'success', true);
    } catch (error: unknown) {
      this.snackbarService.createSnackbar(`Errore durante la cancellazione del periodo salvato.`, 'error', true);
    }
  }
}