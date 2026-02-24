/** Dependencies */
import { Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

/** Environment */
import { environment } from '../../environments/environment';

/** Models */
import { User } from '../models';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user = signal<User | null>(null);

  constructor(private oauthService: OAuthService) {
    this.configureAuth();

    this.oauthService.events.subscribe((event) => {
      if (event.type === 'token_received') {
        const payload: any = this._parseJsonWebToken(this.getAccessToken());
        const user: User | undefined = this._createUserFromJsonWebToken(payload);
        this.user.set(user ?? null);
      }

      if (event.type === 'session_terminated' || event.type === 'session_error') {
        this.user.set(null);
      }
    });
  }

  public configureAuth(): void {
    this.oauthService.configure(environment.keycloak);
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(async () => {      
        // this.oauthService.setupAutomaticSilentRefresh();
        // this.oauthService.timeoutFactor = 1;
        await this.checkAccessAndRefreshToken();
        this._checkAccessTokenAndLogin();
      })
  }

  public async checkAccessAndRefreshToken() {
    if (!this.oauthService.hasValidAccessToken()) {
      if (this.oauthService.getRefreshToken()) {
        try {
          await this.oauthService.refreshToken();
        } catch {
          this.logout();
          this.user.set(null);
          return;
        }
      } else {
        this.user.set(null);
      }
    }
  }

  private _checkAccessTokenAndLogin() {
    if (this.oauthService.hasValidAccessToken()) {
      const payload: any = this._parseJsonWebToken(this.getAccessToken());
      const user = this._createUserFromJsonWebToken(payload);
      this.user.set(user ?? null);
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
    if (!this.isLoggedIn()) this.oauthService.initLoginFlow(undefined, { prompt: 'login' });
  }

  public logout(): void {
    this.oauthService.logOut(false);
    this.oauthService.revokeTokenAndLogout();
    this._clearOAuthStorage();
    this.user.set(null);
  }

  private _clearOAuthStorage(): void {
    const keysToRemove = [
      'access_token',
      'refresh_token',
      'id_token',
      'expires_at',
      'id_token_claims_obj',
      'session_state',
      'nonce',
      'pkce_verifier',
      'oauth_nonce'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private _parseJsonWebToken(jwt: string) {
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  private _createUserFromJsonWebToken(payload: any): User | undefined {
    if (!payload) return;
    return User.createFromObject(payload);
  }
}