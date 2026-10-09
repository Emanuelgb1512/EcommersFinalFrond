import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './components/toasts/toasts.component';
import { CarritoService } from './services/carrito.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Se inyecta para que el carrito se sincronice apenas arranca la app
  private carrito = inject(CarritoService);

  progreso = signal(0);
  mostrarSubir = signal(false);

  @HostListener('window:scroll')
  alHacerScroll(): void {
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    this.progreso.set(alto > 0 ? Math.min(100, (window.scrollY / alto) * 100) : 0);
    this.mostrarSubir.set(window.scrollY > 500);
  }

  subir(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}