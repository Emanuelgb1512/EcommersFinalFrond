import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CONTACTO } from '../../utils/contacto';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav class="pila" aria-label="Contacto">
      <a class="op" [href]="c.instagramUrl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <span class="etiqueta">Instagram · {{ c.instagramUsuario }}</span>
        <span class="circulo"><app-icon name="instagram" [size]="24" /></span>
      </a>

      <a class="op" [href]="c.telefonoUrl" aria-label="Llamar por teléfono">
        <span class="etiqueta">Llamar · {{ c.telefonoVisible }}</span>
        <span class="circulo"><app-icon name="phone" [size]="22" /></span>
      </a>

      <a class="op whatsapp" [href]="c.whatsappUrl" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <span class="etiqueta">Escríbenos por WhatsApp</span>
        <span class="circulo"><app-icon name="whatsapp" [size]="28" /></span>
      </a>
    </nav>
  `,
  styles: [`
    :host { position: fixed; right: 22px; bottom: 22px; z-index: 90; }

    .pila { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }

    .op {
      display: flex; align-items: center; gap: 10px;
      animation: popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
    }
    .op:nth-child(1) { animation-delay: 0.9s; }
    .op:nth-child(2) { animation-delay: 1.0s; }
    .op:nth-child(3) { animation-delay: 1.1s; }

    .circulo {
      width: 52px; height: 52px; border-radius: 50%;
      display: grid; place-items: center;
      background: var(--ink); color: #fff;
      box-shadow: var(--shadow-md);
      transition: transform 0.2s, background 0.2s;
    }
    .op:hover .circulo, .op:focus-visible .circulo { background: var(--orange); transform: translateY(-3px) scale(1.08); }

    .etiqueta {
      background: #fff; color: var(--ink);
      padding: 8px 14px; border-radius: 999px;
      font-size: 13px; font-weight: 700; white-space: nowrap;
      box-shadow: var(--shadow-md);
      opacity: 0; transform: translateX(10px); pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
    }
    .op:hover .etiqueta, .op:focus-visible .etiqueta { opacity: 1; transform: none; }

    /* WhatsApp resalta con el naranja de la marca */
    .whatsapp .circulo { width: 58px; height: 58px; background: var(--orange); animation: pulse 2s infinite; }
    .whatsapp:hover .circulo, .whatsapp:focus-visible .circulo { background: var(--orange-dark); }

    @media (max-width: 520px) {
      :host { right: 14px; bottom: 14px; }
      .circulo { width: 46px; height: 46px; }
      .whatsapp .circulo { width: 52px; height: 52px; }
    }
  `]
})
export class ContactoComponent {
  c = CONTACTO;
}