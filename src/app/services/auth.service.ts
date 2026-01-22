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
      .then(() => {
        this.oauthService.setupAutomaticSilentRefresh()
        this._checkAccessTokenAndLogin()
      })
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
    if (!this.isLoggedIn()) this.oauthService.initLoginFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
    this.oauthService.revokeTokenAndLogout();
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
    // const payload: any = this._parseJsonWebToken(this.getAccessToken());
    if (!payload) return;
    const email: string | undefined = payload['email'];
    const roles: string[] = ('realm_access' in payload && 'roles' in payload['realm_access'] && Array.isArray(payload['realm_access']['roles'])) ?
      payload['realm_access']['roles'] :
      [];
    return (email && roles.length > 0) ? new User(email, roles) : undefined;
  }
}