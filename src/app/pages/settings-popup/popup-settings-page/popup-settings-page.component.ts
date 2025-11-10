/** Libraries */
import { Component, effect } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { createStationPopupConfigFromObject, StationPopupConfig } from '../../../models';

/** Services */
import { AuthService, PopupService } from '../../../services';

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

  public isLoading = false;

  /** Data */
  public user: Record<string, any> | null = null;
  
  public stationPopupConfig: StationPopupConfig; // Recovered from route resolver in constructor

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private popupService: PopupService
  ) {
    this.stationPopupConfig = this.route.snapshot.data['stationPopupConfig'];
    this.form = this._createStationPopupConfigForm(this.stationPopupConfig);

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
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
    this.popupService.savePopupConfig(createStationPopupConfigFromObject(this.form.value))
      .catch((err: unknown) => {
        console.error(err);
      })
      .finally(() => {
        this.form.markAsPristine();
        this.isLoading = false;
      })
  }
}