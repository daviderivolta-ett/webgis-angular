/** Libraries */
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Types
type AppRoute = {
  path: string,
  label: string
}

/** Component */
@Component({
  selector: 'app-settings-nav-menu',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './settings-nav-menu.component.html',
  styleUrl: './settings-nav-menu.component.scss'
})
export class SettingsNavMenuComponent {
  public menu: AppRoute[] = [
    {
      path: 'stazioni',
      label: 'Stazioni'
    },
    {
      path: 'popup',
      label: 'Popup'
    },
    {
      path: 'periodi',
      label: 'Periodi'
    }
  ];
}