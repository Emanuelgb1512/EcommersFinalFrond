import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <span class="logo" [class.claro]="claro">
      <span class="mark">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
      <span class="word">SPORT<b>ZONE</b></span>
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
    .logo { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); }
    .logo.claro { color: #fff; }
    .mark {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--orange); color: #fff;
      display: grid; place-items: center;
      transform: skew(-8deg);
    }
    .word {
      font-family: var(--font-display);
      font-size: 28px; font-weight: 800; font-style: italic;
      letter-spacing: 0.02em; line-height: 1;
    }
    .word b { color: var(--orange); font-weight: 800; }
  `]
})
export class LogoComponent {
  @Input() claro = false;
}