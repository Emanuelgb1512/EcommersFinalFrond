import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

// Hace que un elemento aparezca con animación cuando entra en pantalla
@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  // Retraso opcional en milisegundos: appReveal="150" o [appReveal]="i * 80"
  @Input() appReveal: string | number = '';

  ngOnInit(): void {
    const nodo = this.el.nativeElement as HTMLElement;
    nodo.classList.add('reveal');
    nodo.style.setProperty('--d', `${Number(this.appReveal) || 0}ms`);

    if (typeof IntersectionObserver === 'undefined') {
      nodo.classList.add('visible');
      return;
    }

    this.observer = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) {
        nodo.classList.add('visible');
        this.observer?.disconnect();
      }
    }, { threshold: 0.12 });

    this.observer.observe(nodo);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}