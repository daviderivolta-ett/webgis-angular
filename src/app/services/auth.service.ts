/** Dependencies */
import { Injectable, signal } from '@angular/core';
import { AuthConfig, NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isUserLoggedIn = signal<boolean>(false);

  private _authConfig: AuthConfig = {
    issuer: 'https://accounts.d4science.org/auth/realms/d4science',
    redirectUri: window.location.origin + '/dataset-store',
    clientId: 'Itineris-Marine-Hub-Autentication',
    dummyClientSecret: 'dl6IXDhLwQ2PYQ72MAIQaquzQUyanoDC',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    showDebugInformation: true,
    useSilentRefresh: false,
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    sessionChecksEnabled: true,
    strictDiscoveryDocumentValidation: false,
  }

  constructor(private oauthService: OAuthService) {
    this.configureAuth();

    this.oauthService.events.subscribe((event) => {
      if (event.type === 'token_received') this.isUserLoggedIn.set(true);
      if (event.type === 'session_terminated' || event.type === 'session_error') this.isUserLoggedIn.set(false);
    });
  }

  public configureAuth(): void {
    this.oauthService.configure(this._authConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken()
  }

  public login(): void {
    if (!this.isLoggedIn()) this.oauthService.initLoginFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
    this.oauthService.revokeTokenAndLogout();
  }
}