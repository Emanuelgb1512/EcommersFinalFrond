import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../models/carrito.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NavbarComponent, FooterComponent, IconComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  carrito = inject(CarritoService);
  auth = inject(AuthService);
  private router = inject(Router);

  ivaPct = Math.round(environment.iva * 100);

  hayProblemas = computed(() =>
    this.carrito.items().some(i => !i.activo || i.cantidad > i.stock)
  );

  subir(i: CarritoItem): void {
    this.carrito.cambiarCantidad(i.productoId, i.cantidad + 1);
  }

  bajar(i: CarritoItem): void {
    this.carrito.cambiarCantidad(i.productoId, i.cantidad - 1);
  }

  quitar(i: CarritoItem): void {
    this.carrito.quitar(i.productoId);
  }

  pagar(): void {
    this.router.navigate(['/checkout']);
  }
}