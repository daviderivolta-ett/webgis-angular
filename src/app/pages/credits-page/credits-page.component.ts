/* Dependencies */
import { Component, inject } from '@angular/core'

/* Types */
import { User } from '../../models'

/* Services */
import { TenantsService } from '../../services'

/* Components */
import { HeaderComponent, NotificationIconComponent } from '../../components'

/* Component */
@Component({
  selector: 'app-credits-page',
  imports: [HeaderComponent, NotificationIconComponent],
  templateUrl: './credits-page.component.html',
  styleUrl: './credits-page.component.scss'
})
export class CreditsPageComponent {
  /* Dependency injection */
  private tenantsService = inject(TenantsService);

  /* Data */
  public user: User | null = null;

  public selectedTenant; // Recovered from service in constructor
  public selectedTenantMsg; // Recovered from service in constructor

  /* Constructor */
  constructor() {
    /** Recovering from services */
    this.selectedTenant = this.tenantsService.selectedTenant;
    this.selectedTenantMsg = this.tenantsService.message;
  }
}