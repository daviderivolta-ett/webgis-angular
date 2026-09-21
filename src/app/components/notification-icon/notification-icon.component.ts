/* Dependencies */
import { Component, input } from '@angular/core';

/* Component */
@Component({
  selector: 'app-notification-icon',
  imports: [],
  templateUrl: './notification-icon.component.html',

  styleUrl: './notification-icon.component.scss',
})
export class NotificationIconComponent {
  public readonly defaultIcon: string =
    'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2220px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2220px%22%20fill%3D%22%23000000%22%3E%3Cpath%20d%3D%22M192-216v-72h48v-240q0-87%2053.5-153T432-763v-53q0-20%2014-34t34-14q20%200%2034%2014t14%2034v53q85%2016%20138.5%2082T720-528v240h48v72H192Zm288-276Zm-.21%20396Q450-96%20429-117.15T408-168h144q0%2030-21.21%2051t-51%2021ZM312-288h336v-240q0-70-49-119t-119-49q-70%200-119%2049t-49%20119v240Z%22%2F%3E%3C%2Fsvg%3E';
  public iconUrl = input<string>();
  public emptyMsg = input<string>('Nessuna notifica non letta');
  public notifications = input<string[]>([]);
}
