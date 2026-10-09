import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { ToastService } from '../../services/toast.service';
import { Pedido } from '../../models/pedido.model';
import { IconComponent } from '../icon/icon.component';
import { aFecha, claseEstado, etiquetaPago } from '../../utils/estados';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, IconComponent],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.css'
})
export class AdminPedidosComponent implements OnInit {
  private service = inject(PedidoService);
  private toast = inject(ToastService);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  guardando = signal(false);

  filtroPago = signal('');
  filtroEstado = signal('');
  busqueda = signal('');

  seleccionado = signal<Pedido | null>(null);
  nuevoEstado = '';
  nuevoPago = '';

  estadosPedido = ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];
  estadosPago = ['Pendiente', 'En proceso', 'Aprobado', 'Rechazado'];

  claseEstado = claseEstado;
  etiquetaPago = etiquetaPago;
  fecha = aFecha;

  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase().replace('#', '');
    return this.pedidos().filter(p =>
      (!this.filtroPago() || p.estadoPago === this.filtroPago()) &&
      (!this.filtroEstado() || p.estado === this.filtroEstado()) &&
      (!texto ||
        String(p.id) === texto ||
        p.clienteNombre.toLowerCase().includes(texto) ||
        p.clienteEmail.toLowerCase().includes(texto))
    );
  });

  resumen = computed(() => {
    const lista = this.pedidos();
    const por = (estado: string) => {
      const l = lista.filter(p => p.estadoPago === estado);
      return { n: l.length, monto: l.reduce((s, p) => s + p.total, 0) };
    };
    return {
      total: lista.length,
      pendiente: por('Pendiente'),
      proceso: por('En proceso'),
      aprobado: por('Aprobado')
    };
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.todos().subscribe({
      next: lista => { this.pedidos.set(lista); this.cargando.set(false); },
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudieron cargar los pedidos.'));
      }
    });
  }

  abrir(p: Pedido): void {
    this.seleccionado.set(p);
    this.nuevoEstado = p.estado;
    this.nuevoPago = p.estadoPago ?? '';
  }

  cerrar(): void {
    this.seleccionado.set(null);
  }

  guardarEstado(): void {
    const p = this.seleccionado();
    if (!p || this.nuevoEstado === p.estado) return;

    if (this.nuevoEstado === 'Cancelado' &&
        !confirm('Se cancelará el pedido y se devolverá el stock. ¿Continuar?')) return;

    this.guardando.set(true);
    this.service.cambiarEstado(p.id, this.nuevoEstado).subscribe({
      next: actualizado => this.alActualizar(actualizado, 'Estado del pedido actualizado.'),
      error: e => this.alFallar(e, p)
    });
  }

  guardarPago(): void {
    const p = this.seleccionado();
    if (!p || this.nuevoPago === p.estadoPago) return;

    this.guardando.set(true);
    this.service.cambiarEstadoPago(p.id, this.nuevoPago).subscribe({
      next: actualizado => this.alActualizar(actualizado, 'Estado del pago actualizado.'),
      error: e => this.alFallar(e, p)
    });
  }

  private alActualizar(p: Pedido, mensaje: string): void {
    this.pedidos.update(l => l.map(x => x.id === p.id ? p : x));
    this.seleccionado.set(p);
    this.nuevoEstado = p.estado;
    this.nuevoPago = p.estadoPago ?? '';
    this.guardando.set(false);
    this.toast.exito(mensaje);
  }

  private alFallar(e: unknown, p: Pedido): void {
    this.guardando.set(false);
    this.nuevoEstado = p.estado;
    this.nuevoPago = p.estadoPago ?? '';
    this.toast.error(mensajeError(e, 'No se pudo guardar el cambio.'));
  }
}