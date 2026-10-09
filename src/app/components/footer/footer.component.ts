import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  template: `
    <footer class="footer">
      <div class="container grid">
        <div class="col marca">
          <app-logo [claro]="true" />
          <p>Equipamiento deportivo para quienes entrenan en serio. Calidad, variedad y buen precio en un solo lugar.</p>
        </div>
        <div class="col">
          <h4>Tienda</h4>
          <a routerLink="/" fragment="productos">Todos los productos</a>
          <a routerLink="/categorias">Categorías</a>
          <a routerLink="/registro">Crear cuenta</a>
        </div>
        <div class="col">
          <h4>Ayuda</h4>
          <span>Envíos a todo el país</span>
          <span>Pagos seguros</span>
          <span>Cambios y devoluciones</span>
        </div>
        <div class="col">
          <h4>Acceso</h4>
          <a routerLink="/login">Iniciar sesión</a>
          <a routerLink="/admin/login">Administrador</a>
        </div>
      </div>
      <div class="legal">
        <div class="container">© {{ anio }} SportZone. Todos los derechos reservados.</div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: var(--ink); color: #aab2c0; margin-top: 40px; }
    .grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 40px; padding-top: 56px; padding-bottom: 40px; }
    .col { display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
    .col h4 { color: #fff; font-size: 20px; margin-bottom: 6px; }
    .col a:hover { color: var(--orange); }
    .marca p { max-width: 320px; margin-top: 8px; line-height: 1.6; }
    .legal { border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 18px 0; font-size: 13px; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr 1fr; } .marca { grid-column: 1 / -1; } }
  `]
})
export class FooterComponent {
  anio = new Date().getFullYear();
}