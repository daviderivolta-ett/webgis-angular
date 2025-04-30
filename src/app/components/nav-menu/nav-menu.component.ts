// Libraries
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Types
type AppRoute = {
  path: string,
  label: string,
  iconUrl: string
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
  public menu: AppRoute[] = [
    {
      path: 'dati',
      label: 'Dati',
      iconUrl: 'icons/map_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'
    },
    {
      path: 'tabelle',
      label: 'Tabelle',
      iconUrl: 'icons/table_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'
    },
    {
      path: 'radar',
      label: 'Satellite e radar',
      iconUrl: 'icons/satellite_alt_20dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.svg'
    }
  ];
}