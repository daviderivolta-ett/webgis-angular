// Libraries
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Pipes */
import { ArrayIncludesPipe } from '../../pipes';

// Types
type AppRoute = {
  path: string,
  label: string,
  iconUrl: string,
  requiresAuth: boolean,
  isExternal?: boolean,
  requiredRole?: string
}

// Component
@Component({
  selector: 'app-nav-menu',
  imports: [
    RouterLink,
    RouterLinkActive,
    ArrayIncludesPipe
  ],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
  public userRoles = input<string[]>([]);

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
      requiresAuth: false
    },
    // {
    //   path: 'satellite',
    //   label: 'Satellite',
    //   iconUrl: 'images/icons/satellite_alt_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.svg',
    //   requiresAuth: false
    // },
    {
      path: 'radar',
      label: 'Radar',
      iconUrl: 'images/icons/radar_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.svg',
      requiresAuth: false
    },
    {
      path: 'https://omirl-dev-ett.cfmi.arpal.org/dashboard',
      label: 'Dashboard',
      iconUrl: 'images/icons/open_in_new_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.svg',
      requiresAuth: true,
      isExternal: true
    },
    {
      path: 'settings',
      label: 'Configurazioni',
      iconUrl: 'images/icons/settings_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg',
      requiresAuth: true,
      requiredRole: 'editor'
    }
  ];
}