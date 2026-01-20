/** Dependencies */
import { Component, effect, input } from '@angular/core';

/** Services */
import { AuthService } from '../../services';

/** Models */
import { User } from '../../models';

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

  public user: User | null = null;

  constructor(private authService: AuthService) {
    effect(() => this.user = this.authService.user());
  }

  public initAuthFlow(): void {
    this.user ?
      this.authService.logout() :
      this.authService.login();
  }

  public login() {
    this.authService.login();
  }

  public logout() {
    this.authService.logout();
  }
}
