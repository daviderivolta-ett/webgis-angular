/** Dependencies */
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

/** Services */
import { AuthService } from './services'

/** Components */
import { SnackbarContainerComponent } from './components'

/** Component */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SnackbarContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'omirl';

  constructor(private authService: AuthService) { }
}