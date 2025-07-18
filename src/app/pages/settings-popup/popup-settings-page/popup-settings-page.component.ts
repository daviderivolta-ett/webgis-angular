/** Libraries */
import { Component } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { StationPopupConfig } from '../../../models';

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
  public stationPopupConfig: StationPopupConfig; // Recovered from route resolver in constructor

  constructor(private route: ActivatedRoute) {
    this.stationPopupConfig = this.route.snapshot.data['stationPopupConfig'];
    this.form = this._createStationPopupConfigForm(this.stationPopupConfig);
  }

  /** Methods */
  private _createStationPopupConfigForm(config: StationPopupConfig): FormGroup {
    const formGroup = new FormGroup({});

    Object.entries(config).forEach(([k, v]: [string, boolean]) => {
      formGroup.addControl(k, new FormControl(v))
    });

    return formGroup;
  }

  public onFormSubmit(): void {
    console.log('submit', this.form.value);
    this.isLoading = true;
  }
}