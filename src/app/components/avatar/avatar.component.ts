import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <span class="av" [style.width.px]="size" [style.height.px]="size" [style.fontSize.px]="size * 0.42">
      @if (fotoUrl) {
        <img [src]="fotoUrl" [alt]="nombre" />
      } @else {
        {{ inicial }}
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .av {
      display: inline-grid; place-items: center; flex-shrink: 0;
      border-radius: 50%; overflow: hidden; user-select: none;
      background: var(--orange); color: #fff; font-weight: 800;
    }
    .av img { width: 100%; height: 100%; object-fit: cover; }
  `]
})
export class AvatarComponent {
  @Input() nombre = '';
  @Input() fotoUrl: string | null | undefined = null;
  @Input() size = 42;

  get inicial(): string {
    return (this.nombre || '?').trim().charAt(0).toUpperCase();
  }
}