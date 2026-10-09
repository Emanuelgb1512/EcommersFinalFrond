import { Component, ElementRef, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, LogoComponent, AvatarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  auth = inject(AuthService);
  carrito = inject(CarritoService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private el = inject(ElementRef);

  menuAbierto = signal(false);
  bump = signal(false);
  inicial = computed(() => (this.auth.usuario()?.nombre ?? '?').trim().charAt(0).toUpperCase());

  constructor() {
    // Rebote del carrito cada vez que cambia la cantidad
    let primera = true;
    effect(() => {
      this.carrito.cantidadTotal();
      if (primera) { primera = false; return; }
      untracked(() => {
        this.bump.set(false);
        setTimeout(() => this.bump.set(true), 20);
        setTimeout(() => this.bump.set(false), 700);
      });
    });
  }

  @HostListener('document:click', ['$event'])
  cerrarAlHacerClicAfuera(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) this.menuAbierto.set(false);
  }

  alternarMenu(): void {
    this.menuAbierto.update(v => !v);
  }

  buscar(texto: string): void {
    this.router.navigate(['/'], {
      queryParams: { busqueda: texto.trim() || null },
      fragment: 'productos'
    });
  }

  salir(): void {
    this.menuAbierto.set(false);
    this.auth.cerrarSesion();
    this.toast.info('Sesión cerrada.');
  }
}