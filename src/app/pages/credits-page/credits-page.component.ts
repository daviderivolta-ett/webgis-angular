/* Dependencies */
import { Component, ChangeDetectionStrategy } from '@angular/core';

/* Types */
import { User } from '../../models';

/* Components */
import { HeaderComponent } from '../../components';

/* Component */
@Component({
  selector: 'app-credits-page',
  imports: [HeaderComponent],
  templateUrl: './credits-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './credits-page.component.scss',
})
export class CreditsPageComponent {
  /* Data */
  public user: User | null = null;
}
