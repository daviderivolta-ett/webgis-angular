/* Dependencies */
import { effect, inject, Injectable, signal } from '@angular/core'
import { OAuthService } from 'angular-oauth2-oidc'

/* Config */
import { environment } from '../../environments/environment'

/* Types */
import { User } from '../models'

/* Service */
@Injectable({
  providedIn: 'root'
})
export class Auth2Service {
  #oauthService = inject(OAuthService);
  public user = signal<User | null>(null);
  public readonly token = signal<string | undefined>(undefined);

  constructor() {
    effect(() => console.log(this.token()));
  }

  public async init(): Promise<void> {
    this.#setupEvents();
    await this.#configure();
  }

  async #configure(): Promise<void> {
    this.#oauthService.configure(environment.keycloak);
    await this.#oauthService.loadDiscoveryDocumentAndTryLogin();
    this.#oauthService.setupAutomaticSilentRefresh({ timeoutFactor: .75, useRefreshToken: true })
    if (this.#oauthService.hasValidAccessToken()) await this.#loadUser();
  }

  #setupEvents(): void {
    this.#oauthService.events.subscribe(async event => {
      switch (event.type) {

        case 'token_received':
          console.log('token receveid');

          this.token.set(this.#oauthService.getAccessToken() ?? undefined);
          const profile = await this.#oauthService.loadUserProfile();
          // this.user.set((profile as any).info ?? null);
          this.user.set(User.createFromObject(this.#parseJsonWebToken(this.token() ?? '')) ?? null);
          break;

        case 'token_expires':
          console.log('token expiring soon');
          break;

        case 'session_terminated':
          this.user.set(null);
          console.log('session ended');
          break;

        case 'session_error':
          this.user.set(null);
          console.error('session error');
          break;

        case 'token_refresh_error':
          this.user.set(null);
          console.error('token refresh error');
          this.login();
          break;

        case 'token_refreshed':
          console.log('token refreshed');
          this.token.set(this.#oauthService.getAccessToken() ?? undefined);
          break;
      }
    });
  }

  async #loadUser(): Promise<void> {
    const profile = await this.#oauthService.loadUserProfile();
    this.token.set(this.#oauthService.getAccessToken() ?? undefined);
    // this.user.set((profile as any).info ?? null);
    this.user.set(User.createFromObject(this.#parseJsonWebToken(this.token() ?? '')) ?? null);
  }

  public login(): void {
    this.#oauthService.initLoginFlow(undefined, { prompt: 'login' });
  }

  public logout(): void {
    this.user.set(null);
    this.#oauthService.revokeTokenAndLogout();
  }

  public getAccessToken(): string {
    return this.#oauthService.getAccessToken();
  }

  public getIdentityClaims(): Record<string, any> {
    return this.#oauthService.getIdentityClaims();
  }

  public async getUserProfile(): Promise<Object> {
    return this.#oauthService.loadUserProfile();
  }

  public hasValidAccessToken(): boolean {
    return this.#oauthService.hasValidAccessToken();
  }

  #parseJsonWebToken(jwt: string) {
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''));
    return JSON.parse(jsonPayload);
  }
}