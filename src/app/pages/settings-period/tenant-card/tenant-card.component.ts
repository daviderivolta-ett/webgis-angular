/* Dependencies */
import { Component, input, output } from '@angular/core'

/* Models */
import { Tenant } from '../../../models'

/* Component */
@Component({
  selector: 'app-tenant-card',
  imports: [],
  templateUrl: './tenant-card.component.html',
  styleUrl: './tenant-card.component.scss'
})
export class TenantCardComponent {
  public tenant = input.required<Tenant>();
  public isSelected = input<boolean>(false);

  public selected = output<string>();
  public deleted = output<string>();
  public loaded = output<string>();
  public unloaded = output<string>();

  /* Methods */
  public onSelectClick(): void {
    this.selected.emit(this.tenant().id);
  }

  public onDeleteClick(): void {
    this.deleted.emit(this.tenant().id);
  }

  public toggleStatusClick(): void {
    if (this.tenant().isLoaded) this.unloaded.emit(this.tenant().id);
    else this.loaded.emit(this.tenant().id);
  }
}