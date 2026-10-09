import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { PedidoService } from '../../services/pedido.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { IconComponent } from '../../components/icon/icon.component';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, NavbarComponent, FooterComponent, IconComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private pedidos = inject(PedidoService);
  private router = inject(Router);
  private toast = inject(ToastService);
  carrito = inject(CarritoService);

  ivaPct = Math.round(environment.iva * 100);
  enviando = signal(false);

  hayProblemas = computed(() =>
    this.carrito.items().some(i => !i.activo || i.cantidad > i.stock)
  );

  metodos = [
    { valor: 'Tarjeta', titulo: 'Tarjeta crédito o débito', desc: 'Pago inmediato' },
    { valor: 'PSE', titulo: 'PSE', desc: 'Débito desde tu banco' },
    { valor: 'Contraentrega', titulo: 'Contraentrega', desc: 'Pagas al recibir tu pedido' }
  ];

  form = this.fb.nonNullable.group({
    direccionEnvio: ['', [Validators.required, Validators.maxLength(200)]],
    ciudad: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(30)]],
    metodoPago: ['Tarjeta', [Validators.required]]
  });

  ngOnInit(): void {
    const u = this.auth.usuario();
    this.form.patchValue({
      direccionEnvio: u?.direccion ?? '',
      ciudad: u?.ciudad ?? '',
      telefono: u?.telefono ?? ''
    });
  }

  metodoActual(): string {
    return this.form.controls.metodoPago.value;
  }

  invalido(campo: 'direccionEnvio' | 'ciudad' | 'telefono'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.hayProblemas()) {
      this.toast.error('Hay productos sin stock suficiente. Revisa tu carrito.');
      return;
    }

    this.enviando.set(true);
    this.pedidos.checkout(this.form.getRawValue()).subscribe({
      next: pedido => {
        this.carrito.recargar();
        this.toast.exito(`¡Pedido #${pedido.id} creado!`);
        this.router.navigate(['/mis-pedidos'], { queryParams: { nuevo: pedido.id } });
      },
      error: e => {
        this.enviando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo crear el pedido.'));
        this.carrito.recargar();
      }
    });
  }
}