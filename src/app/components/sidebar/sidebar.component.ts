/* Dependencies */
import {
  Component,
  effect,
  HostListener,
  input,
  output
} from '@angular/core';

/* Component */
@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',

  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  public isOpen: boolean = false;

  public iconUrl = input<string>('');
  public side = input<'left' | 'right'>('left');
  public togglePosition = input<'top' | 'bottom'>('top');
  public height = input<string>('100%');
  public width = input<string>('360px');
  public currentWidth: string = this.width();
  public backgroundColor = input<string>('#fff');
  public borderColor = input<string>('#ddd');
  public color = input<string>('#373737');

  public toggled = output<boolean>();

  constructor() {
    effect(() => (this.currentWidth = this.width()));
  }

  /* Methods */
  @HostListener('window:resize', ['$event'])
  public onResize(event: UIEvent) {
    const windowWidth: number = (event.target as Window).innerWidth;
    this.currentWidth = windowWidth < 768 ? '100%' : this.width();
  }

  public toggleSidebar(value: boolean): void {
    this.isOpen = value;
    this.toggled.emit(value);
  }
}
