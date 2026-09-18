/* Dependencies */
import { Component, effect, inject, input, ChangeDetectionStrategy } from '@angular/core';

/* Services */
import { Auth2Service } from '../../services';

/* Models */
import { User } from '../../models';

/* Component */
@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private auth2Service: Auth2Service = inject(Auth2Service);

  public loginIcon = input<string>('');
  public loginText = input<string>('Login');
  public logoutIcon = input<string>('');
  public logoutText = input<string>('Esci');

  public user: User | null = null;

  constructor() {
    effect(() => (this.user = this.auth2Service.user()));
  }

  public initAuthFlow(): void {
    if (this.user) this.auth2Service.logout();
    else this.auth2Service.login();
  }

  public login() {
    this.auth2Service.login();
  }

  public logout() {
    this.auth2Service.logout();
  }
}
