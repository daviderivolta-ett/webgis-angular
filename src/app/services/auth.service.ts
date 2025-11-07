/** Dependencies */
import { Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

/** Environment */
import { environment } from '../../environments/environment';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user = signal<Record<string, any> | null>(null);

  constructor(private oauthService: OAuthService) {
    this.configureAuth();

    this.oauthService.events.subscribe((event) => {      
      if (event.type === 'token_received') {
        const claims: Record<string, any> = this.oauthService.getIdentityClaims();
        claims ? this.user.set(claims) : this.user.set(null);
      }

      if (event.type === 'session_terminated' || event.type === 'session_error') {
        this.user.set(null);
      }
    });
  }

  public configureAuth(): void {
    this.oauthService.configure(environment.keycloak);
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        this.oauthService.setupAutomaticSilentRefresh()
        this._checkAccessTokenAndLogin()
      })
  }

  private _checkAccessTokenAndLogin() {
    if (this.oauthService.hasValidAccessToken()) {
      const claims: Record<string, any> = this.oauthService.getIdentityClaims();
      claims ? this.user.set(claims) : this.user.set(null);
    } else {
      this.user.set(null);
    }
  }

  public getAccessToken() {
    return this.oauthService.getAccessToken();
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public login(): void {    
    if (!this.isLoggedIn()) this.oauthService.initLoginFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
    this.oauthService.revokeTokenAndLogout();
  }
}