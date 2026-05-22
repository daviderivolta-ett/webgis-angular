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

  public select = output<string>();
  public delete = output<string>();
  public load = output<string>();
  public unload = output<string>();

  /* Methods */
  public onSelectClick(): void {
    this.select.emit(this.tenant().id);
  }

  public onDeleteClick(): void {
    this.delete.emit(this.tenant().id);
  }

  public toggleStatusClick(): void {
    this.tenant().isLoaded ? this.unload.emit(this.tenant().id) : this.load.emit(this.tenant().id);
  }
}