import {
  AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject, signal
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './components/toasts/toasts.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { CarritoService } from './services/carrito.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent, ContactoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  // Se inyecta para que el carrito se sincronice apenas arranca la app
  private carrito = inject(CarritoService);
  private zone = inject(NgZone);

  mostrarSubir = signal(false);
  @ViewChild('barra') barra?: ElementRef<HTMLSpanElement>;

  private pendiente = false;

  private alScroll = (): void => {
    if (this.pendiente) return;
    this.pendiente = true;

    requestAnimationFrame(() => {
      this.pendiente = false;

      const alto = document.documentElement.scrollHeight - window.innerHeight;
      const pct = alto > 0 ? Math.min(100, (window.scrollY / alto) * 100) : 0;
      if (this.barra) this.barra.nativeElement.style.width = pct + '%';

      const mostrar = window.scrollY > 500;
      if (mostrar !== this.mostrarSubir()) {
        this.zone.run(() => this.mostrarSubir.set(mostrar));
      }
    });
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() =>
      window.addEventListener('scroll', this.alScroll, { passive: true })
    );
    this.alScroll();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.alScroll);
  }

  subir(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}