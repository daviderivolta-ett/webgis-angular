/* Dependencies */
import { Directive, ElementRef, HostListener, output } from '@angular/core'

/* Directive */
@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  public clickOutside = output<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  public onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) this.clickOutside.emit();
  }
}