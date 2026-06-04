/* Dependencies */
import { computed, Injectable, signal } from '@angular/core'

/* Models */
import { Tenant } from '../models'

/* Services */
import { ApiService } from './api.service'

/* Service */
@Injectable({
  providedIn: 'root'
})
export class TenantsService {
  #tenants = signal<Tenant[]>([])

  #selectedTenant = signal<Tenant | null>(null);
  selectedTenant = this.#selectedTenant.asReadonly();

  public message = computed<string | null>(() => {
    const selectedTenant = this.selectedTenant();
    if (!selectedTenant) return null;
    const tenant = this.#tenants().find((t) => t.id === selectedTenant.id);
    if (!tenant) return null;
    return `Periodo salvato selezionato:\n${tenant.id}\n${new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(tenant.fromDate))} - ${new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(tenant.toDate))}`
  });

  constructor(private apiService: ApiService) { }

  public getAllTenants(url: string, token?: string): Promise<Tenant[]> {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (!Array.isArray(data)) throw new Error(`Formato non valido.`);
        return data;
      })
      .then((data: any[]) => {
        const tenants = data.map((d: any) => Tenant.createFromObject(d));
        this.#tenants.set(tenants);
        return tenants;
      });
  }

  public toggleTenant(id: string) {
    const tenant = this.#tenants().find((t) => t.id === id);
    if (!tenant) return;
    const currentTenant: Tenant | null = this.#selectedTenant();
    this.#selectedTenant.set(tenant.id !== currentTenant?.id ? tenant : null);
  }

  public buildUrlWithTenant(baseUrl: string, bridge: string, endpoint: string): string {
    return this.apiService.buildUrl(
      baseUrl,
      this.selectedTenant() ? this.apiService.replaceApiUrlPlaceholder(bridge, this.selectedTenant()!.id) : '',
      endpoint
    );
  }

  public createTenant(url: string, tenant: Pick<Tenant, 'fromDate' | 'toDate' | 'label'>, token?: string): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${ token }`;

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fromDate: tenant.fromDate,
        toDate: tenant.toDate,
        tenantName: tenant.label,
        loadWhenFinish: false
      })
    })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore durante la cancellazione del tenant(${ res.status })`);
      });
  }

  public loadTenant(url: string, token?: string): Promise<void> {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${ token }`;  

    return fetch(url, {
      method: 'POST',
      headers
    })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore durante il caricamento del tenant(${ res.status })`);
      });
  }

  public unloadTenant(url: string, token?: string): Promise<void> {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${ token }`;

    return fetch(url, {
      method: 'POST',
      headers
    })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore durante lo scaricamento del tenant(${ res.status })`);
      });
  }

  public deleteTenant(url: string, token?: string): Promise<void> {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${ token }`;

    return fetch(url, {
      method: 'DELETE',
      headers,
    })
      .then((res: Response) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Tenant non trovato');
          throw new Error(`Errore durante la cancellazione del tenant(${ res.status })`);
        }
      });
  }
}