/* Dependencies */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/* Components */
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { AuthComponent } from '../auth/auth.component';

/* Component */
@Component({
  selector: 'app-header',
  imports: [NavMenuComponent, AuthComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public userRoles = input<string[]>([]);
}
