/* Dependencies */
import { Directive, ElementRef, HostListener, inject, output } from '@angular/core'

/* Directive */
@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  private elementRef: ElementRef = inject(ElementRef);

  public clickOutside = output<void>();

  @HostListener('document:click', ['$event'])
  public onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) this.clickOutside.emit();
  }
}