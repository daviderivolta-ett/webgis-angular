/** Libraries */
import { Component } from '@angular/core';

/** Components */
import { HeaderComponent, SettingsNavMenuComponent, SidebarComponent } from '../../../components';

/** Component */
@Component({
  selector: 'app-popup-settings-page',
  imports: [
    HeaderComponent,
    SidebarComponent,
    SettingsNavMenuComponent
  ],
  templateUrl: './popup-settings-page.component.html',
  styleUrl: './popup-settings-page.component.scss'
})
export class PopupSettingsPageComponent {
}