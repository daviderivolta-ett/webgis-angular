/** Dependencies */
import { Component, effect } from '@angular/core'
import { RouterOutlet } from '@angular/router'

/** Models */
import { User } from './models'

/** Services */
import { ApiService, AuthService, ConfigService, GlobalStateService } from './services'

/** Components */
import { SnackbarContainerComponent } from './components'

/** Component */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SnackbarContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** User Interface */
  public title: string = 'omirl';

  /** Data */
  public latestConfigUrl: string = '';

  /** Constructor */
  constructor(
    private configService: ConfigService,
    private globalStateService: GlobalStateService,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    /** Effects */
    effect(() => {
      /** Get user query params */
      if (this.globalStateService.hasInterestingQueryParams2(['layer', 'base', 'info', 'lat', 'lon', 'zoom'])) return;
      const currentUser: User | null = this.authService.user();
      if (!currentUser) return;
      this.globalStateService.getLatestUserPreferences(this.apiService.addSearchParamsToUrl(this.latestConfigUrl, { Tag: `${currentUser.id}_preferences` }), this.authService.getAccessToken())
        .then((params) => this.globalStateService.updateAllQueryParams2(new Map(Object.entries(params))))
    });
  }

  /** Component lifecycle */
  public async ngOnInit(): Promise<void> {
    /** Set config url */
    this.configService.getApis()
      .then((apis: Map<string, string>) => {
        this.latestConfigUrl = this.apiService.buildUrl(this.apiService.buildUrl(apis.get('baseUrl') ?? '', apis.get('stationsApi') ?? ''), apis.get('latestConfig') ?? '');
      });
  }
}