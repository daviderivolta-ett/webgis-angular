// Libraries
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Types
type AppRoute = {
  path: string,
  label: string,
  iconUrl: string,
  requiresAuth: boolean
}

// Component
@Component({
  selector: 'app-nav-menu',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
  public isAuth = input<boolean>(false);
  
  public menu: AppRoute[] = [
    {
      path: 'dati',
      label: 'Dati',
      iconUrl: 'images/icons/map_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg',
      requiresAuth: false
    },
    {
      path: 'tabelle',
      label: 'Tabelle',
      iconUrl: 'images/icons/table_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg',
      requiresAuth: true
    },
    {
      path: 'settings',
      label: 'Configurazioni',
      iconUrl: 'images/icons/settings_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg',
      requiresAuth: true
    },
    // {
    //   path: 'radar',
    //   label: 'Satellite e radar',
    //   iconUrl: 'images/icons/satellite_alt_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.svg',
    //   requiresAuth: false
    // }
  ];
}