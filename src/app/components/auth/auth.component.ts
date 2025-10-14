/** Dependencies */
import { Component, effect, input } from '@angular/core';

/** Services */
import { AuthService } from '../../services';

/** Component */
@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  public loginIcon = input<string>('');
  public loginText = input<string>('Login');
  public logoutIcon = input<string>('');
  public logoutText = input<string>('Esci');
  
  public isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {
    effect(() => this.isLoggedIn = this.authService.isUserLoggedIn());
  }

  public initAuthFlow(): void {
    this.authService.isUserLoggedIn() ?
      this.authService.logout() :
      this.authService.login();
  }
}
