/* Dependencies */
import { Component, effect, inject, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'

/* Models */
import { User } from './models'

/* Services */
import { ApiService, Auth2Service, GlobalStateService, SnackbarsService } from './services'

/* Components */
import { SnackbarContainerComponent } from './components'

/* Component */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SnackbarContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  /* Dependency injection */
  private globalStateService: GlobalStateService = inject(GlobalStateService)
  private auth2Service: Auth2Service = inject(Auth2Service)
  private apiService: ApiService = inject(ApiService)
  private snackbarsService: SnackbarsService = inject(SnackbarsService)

  /* User Interface */
  public title: string = 'omirl';

  /* Data */
  public latestConfigUrl: string = '';

  /* Constructor */
  constructor() {
    /** Effects */
    effect(() => {
      /* Get user query params */
      if (this.globalStateService.hasInterestingQueryParams2(['layer', 'base', 'info', 'lat', 'lon', 'zoom'])) return;
      const currentUser: User | null = this.auth2Service.user();
      if (!currentUser) return;
      this.globalStateService.getLatestUserPreferences(this.apiService.addSearchParamsToUrl(this.latestConfigUrl, { Tag: `${currentUser.id}_preferences` }), this.auth2Service.token())
        .then((params) => this.globalStateService.updateAllQueryParams2(new Map(Object.entries(params))))
    });
  }

  /* Component lifecycle */
  public ngOnInit(): void {
    this.snackbarsService.createSnackbar(`Questo sito è attualmente in fase di test. I contenuti potrebbero essere incompleti e/o non aggiornati. Si declina ogni responsabilità per l'uso delle informazioni qui riportate.`, 'error', false);
    this.latestConfigUrl = this.apiService.buildUrl(
      this.apiService.buildUrl(
        this.apiService.apis().get('baseUrl') ?? '',
        this.apiService.apis().get('stationsApi') ?? ''
      ), this.apiService.apis().get('latestConfig') ?? ''
    );
  }
}