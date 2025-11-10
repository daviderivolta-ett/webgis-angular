/** Libraries */
import { Component, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/** Services */
import { ApiService, AuthService } from '../../../services';

/** Components */
import { HeaderComponent, SidebarComponent, SettingsNavMenuComponent, LoadingBtnComponent } from "../../../components";
import { ActivatedRoute } from '@angular/router';

/** Component */
@Component({
  selector: 'app-period-settings-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SettingsNavMenuComponent,
    LoadingBtnComponent,
    /** Directives */
    ReactiveFormsModule
  ],
  templateUrl: './period-settings-page.component.html',
  styleUrl: './period-settings-page.component.scss'
})
export class PeriodSettingsPageComponent {
  /** UI */
  public form = new FormGroup({
    initialDate: new FormControl(this._fromDateToDatetimelocal(new Date), [Validators.required]),
    endingDate: new FormControl(this._fromDateToDatetimelocal(new Date), [Validators.required]),
    alwaysAvailable: new FormControl(false)
  });

  /** Data */
  public user: Record<string, any> | null = null;

  public apiBaseUrl; // Recovered from route resolver in constructor
  public periodsUrl; // Recovered from route resolver in constructor

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.apiBaseUrl = this.route.snapshot.data['apisConfig'].get('baseUrl');
    this.periodsUrl = this.apiService.buildUrl(this.apiBaseUrl, this.route.snapshot.data['apisConfig'].get('periods'));

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    console.log(this.periodsUrl);
  }

  /** Methods */
  public onFormSubmit(): void {
    console.log(this.form.value);
  }

  private _fromDateToDatetimelocal(date: Date): string {
    const newDate: Date = date;
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    return newDate.toISOString().slice(0, 16);
  }
}
