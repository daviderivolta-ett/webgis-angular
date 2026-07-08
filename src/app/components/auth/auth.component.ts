/** Dependencies */
import { Component, effect, input } from '@angular/core';

/** Services */
import { Auth2Service, AuthService } from '../../services';

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

  constructor(private auth2Service: Auth2Service) {
    effect(() => this.user = this.auth2Service.user());
  }

  public initAuthFlow(): void {
    this.user ?
      this.auth2Service.logout() :
      this.auth2Service.login();
  }

  public login() {
    this.auth2Service.login();
  }

  public logout() {
    this.auth2Service.logout();
  }
}
