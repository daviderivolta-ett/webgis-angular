/* Dependencies */
import { Component, input } from '@angular/core'

/* Component */
@Component({
  selector: 'app-webcam',
  imports: [],
  templateUrl: './webcam.component.html',
  styleUrl: './webcam.component.scss'
})
export class WebcamComponent {
  public header = input<string>('');
  public imgUrl = input<string>('');
}
