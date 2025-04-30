// Libraries
import { Component } from '@angular/core';

// Components
import { NavMenuComponent } from '../nav-menu/nav-menu.component';

// Component
@Component({
  selector: 'app-header',
  imports: [
    NavMenuComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
