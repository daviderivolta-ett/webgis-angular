// Libraries
import { Component, effect } from '@angular/core';

/** Services */
import { AuthService } from '../../../services';

// Components
import { HeaderComponent } from '../../../components/header/header.component';

// Component
@Component({
  selector: 'app-radars-page',
  imports: [
    HeaderComponent
  ],
  templateUrl: './radars-page.component.html',
  styleUrl: './radars-page.component.scss'
})
export class RadarsPageComponent {
  /** Data */
  public user: Record<string, any> | null = null;

  constructor(private authService: AuthService) {
    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }
}
