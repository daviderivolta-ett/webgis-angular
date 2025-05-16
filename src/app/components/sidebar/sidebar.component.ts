// Libraries
import { Component, HostListener, input, output } from '@angular/core';

// Component
@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  public isOpen: boolean = false;

  public iconUrl = input<string>('');
  public side = input<'left' | 'right'>('left');
  public height = input<string>('100%');
  public width = input<string>('360px');
  public currentWidth: string = this.width();

  public toggled = output<boolean>();

  // Methods
  @HostListener('window:resize', ['$event'])
  private _onResize(event: UIEvent) {
    const windowWidth: number = (event.target as Window).innerWidth;
    this.currentWidth = (windowWidth < 768) ? '100%' : this.width();
  }

  public toggleSidebar(value: boolean): void {
    this.isOpen = value;
    this.toggled.emit(value);
  }
}